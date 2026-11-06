#!/usr/bin/env bash
set -euo pipefail

# Incremental MD5/ETag-verified S3 deployment + targeted CloudFront invalidation.
# Uses only aws-cli + POSIX/GNU coreutils (awk, find, md5sum, sort) so it runs
# inside minimal containers like `registry.gitlab.com/gitlab-org/cloud-deploy/aws-base:latest`
# without requiring python3 or jq.

BUCKET="${S3_BUCKET:?Error: S3_BUCKET environment variable must be set}"
DIST_ID="${CLOUDFRONT_DISTRIBUTION_ID:?Error: CLOUDFRONT_DISTRIBUTION_ID environment variable must be set}"
DIST_DIR="${1:-./dist}"

if [ ! -d "$DIST_DIR" ]; then
  echo "Error: build output directory '$DIST_DIR' does not exist." >&2
  exit 1
fi

cd "$DIST_DIR"

echo "==> Fetching remote object inventory from s3://${BUCKET} ..."
REMOTE_TSV="$(mktemp)"
# Output tab-separated lines: Key \t ETag \t Size
aws s3api list-objects-v2 \
  --bucket "$BUCKET" \
  --query 'Contents[].[Key, ETag, Size]' \
  --output text | tr -d '"' > "$REMOTE_TSV"
echo "==> Remote inventory complete."

LOCAL_TSV="$(mktemp)"
# Compute MD5 and byte size for all local files in a single batch
if command -v md5sum >/dev/null 2>&1; then
  find . -type f -exec md5sum {} + | sed 's|  \./|\t|' > "$LOCAL_TSV"
else
  find . -type f -exec md5 -r {} + | sed 's| \./|\t|' > "$LOCAL_TSV"
fi

PLAN_FILE="$(mktemp)"

awk -F'\t' -v force_mutable="${FORCE_MUTABLE_RESYNC:-0}" '
  NR == FNR {
    if (NF >= 2 && $1 != "None") {
      remote_etag[$1] = $2
      remote_size[$1] = $3
    }
    next
  }
  {
    md5 = $1
    key = $2
    local_seen[key] = 1
    is_immutable = (index(key, "_astro/") == 1 || index(key, "yt-thumbs/") == 1)
    if (!(key in remote_etag)) {
      print "UPLOAD\t" key
    } else if (!is_immutable && force_mutable == "1") {
      print "UPLOAD\t" key
    } else if (remote_etag[key] != md5) {
      # Skip multipart ETag false-positives on immutable content-hashed assets
      if (index(remote_etag[key], "-") > 0 && is_immutable) {
        next
      }
      print "UPLOAD\t" key
    }
  }
  END {
    for (k in remote_etag) {
      if (!(k in local_seen)) {
        print "DELETE\t" k
      }
    }
  }
' "$REMOTE_TSV" "$LOCAL_TSV" | sort -k1,1r -k2,2 > "$PLAN_FILE"

rm -f "$REMOTE_TSV" "$LOCAL_TSV"

PARALLEL_JOBS="${SYNC_PARALLEL_JOBS:-16}"
UPLOAD_COUNT=0
DELETE_COUNT=0
CHANGED_PATHS=()

IMMUTABLE_FILE="$(mktemp)"
MUTABLE_FILE="$(mktemp)"
DELETE_FILE="$(mktemp)"

cleanup() {
  rm -f "${PLAN_FILE:-}" "${IMMUTABLE_FILE:-}" "${MUTABLE_FILE:-}" "${DELETE_FILE:-}"
}
trap cleanup EXIT

tab="$(printf '\t')"
while IFS="$tab" read -r action key; do
  [ -z "${action:-}" ] && continue
  if [ "$action" = "UPLOAD" ]; then
    UPLOAD_COUNT=$((UPLOAD_COUNT + 1))
    if [[ "$key" == _astro/* || "$key" == yt-thumbs/* ]]; then
      echo "$key" >> "$IMMUTABLE_FILE"
    else
      echo "$key" >> "$MUTABLE_FILE"
      if [[ "$key" == */index.html ]]; then
        CHANGED_PATHS+=("/${key%index.html}")
        CHANGED_PATHS+=("/${key}")
      elif [[ "$key" == "index.html" ]]; then
        CHANGED_PATHS+=("/")
        CHANGED_PATHS+=("/index.html")
      else
        CHANGED_PATHS+=("/${key}")
      fi
    fi
  elif [ "$action" = "DELETE" ]; then
    DELETE_COUNT=$((DELETE_COUNT + 1))
    echo "$key" >> "$DELETE_FILE"
    CHANGED_PATHS+=("/${key}")
  fi
done < "$PLAN_FILE"

# 1. Upload immutable assets concurrently
if [ -s "$IMMUTABLE_FILE" ]; then
  echo "==> Uploading immutable assets in parallel (concurrency: ${PARALLEL_JOBS})..."
  xargs -n 1 -P "$PARALLEL_JOBS" -I {} bash -c '
    set -euo pipefail
    key="$1"
    bucket="$2"
    aws s3 cp "$key" "s3://${bucket}/${key}" \
      --cache-control "public, max-age=31536000, immutable" \
      --only-show-errors
    echo "  [uploaded] $key"
  ' _ {} "$BUCKET" < "$IMMUTABLE_FILE"
fi

# 2. Upload mutable routes concurrently with 4-tier split Edge (s-maxage) & Browser (max-age) Cache-Control
if [ -s "$MUTABLE_FILE" ]; then
  echo "==> Uploading mutable routes in parallel (concurrency: ${PARALLEL_JOBS})..."
  xargs -n 1 -P "$PARALLEL_JOBS" -I {} bash -c '
    set -euo pipefail
    key="$1"
    bucket="$2"
    case "$key" in
      og/*|*.png|*.svg|*.ico|*.webp|*.jpg|*.jpeg)
        cache_ctrl="public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400"
        ;;
      *.xml|*.txt|*.json|*.xsl|*.webmanifest)
        cache_ctrl="public, max-age=3600, s-maxage=86400"
        ;;
      *)
        cache_ctrl="public, max-age=0, s-maxage=31536000, must-revalidate"
        ;;
    esac
    content_type_args=()
    case "$key" in
      *.xsl)         content_type_args=(--content-type "text/xsl") ;;
      *.webmanifest) content_type_args=(--content-type "application/manifest+json") ;;
      *.txt)         content_type_args=(--content-type "text/plain; charset=utf-8") ;;
    esac
    aws s3 cp "$key" "s3://${bucket}/${key}" \
      --cache-control "$cache_ctrl" \
      "${content_type_args[@]}" \
      --only-show-errors
    echo "  [uploaded] $key"
  ' _ {} "$BUCKET" < "$MUTABLE_FILE"
fi

# 3. Delete obsolete remote objects concurrently
if [ -s "$DELETE_FILE" ]; then
  echo "==> Deleting obsolete objects in parallel (concurrency: ${PARALLEL_JOBS})..."
  xargs -n 1 -P "$PARALLEL_JOBS" -I {} bash -c '
    set -euo pipefail
    key="$1"
    bucket="$2"
    aws s3 rm "s3://${bucket}/${key}" --only-show-errors
    echo "  [deleted]  $key"
  ' _ {} "$BUCKET" < "$DELETE_FILE"
fi

echo "==> Sync summary: ${UPLOAD_COUNT} uploaded, ${DELETE_COUNT} deleted."

if [ "${#CHANGED_PATHS[@]}" -eq 0 ]; then
  echo "==> No mutable routes changed; skipping CloudFront invalidation."
elif [ "${#CHANGED_PATHS[@]}" -gt 25 ]; then
  echo "==> ${#CHANGED_PATHS[@]} paths changed (>25); invalidating /* on CloudFront (${DIST_ID})..."
  aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
else
  echo "==> Invalidating ${#CHANGED_PATHS[@]} changed path(s) on CloudFront (${DIST_ID})..."
  aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "${CHANGED_PATHS[@]}"
fi
