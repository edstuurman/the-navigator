/**
 * Progressive Enhancement: Border Beam Viewport Entrance & Mouse-Tracking Hover
 *
 * Automatically observes clickable cards (.border-beam-card) as they enter
 * the viewport for the first time, playing a single, graceful 360° perimeter
 * beam sweep.
 *
 * On mouse hover / move, smoothly steers --border-beam-angle toward the cursor
 * with a center deadzone and shortest-arc damping so passing through the middle
 * of a card never whips or spazzes the beam.
 */

const BEAM_SELECTOR = '.border-beam-card';
// Midpoint of the conic-gradient color stops (45deg..155deg -> ~100deg)
const BEAM_ARC_CENTER_OFFSET_DEG = 100;
// Ignore angle updates when cursor is within 22% of the card center
const CENTER_DEADZONE = 0.22;
// Full tracking responsiveness reached at 65% distance from center to edge
const FULL_RESPONSE_RADIUS = 0.65;
// Base angular smoothing factor per animation frame (60fps)
const BASE_LERP_FACTOR = 0.14;

interface CardBeamState {
  currentAngle: number;
  targetAngle: number;
  distanceWeight: number;
  rafId: number | null;
  initialized: boolean;
}

const cardStates = new WeakMap<HTMLElement, CardBeamState>();
let activeObserver: IntersectionObserver | null = null;
let pointerTrackingBound = false;

function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function shortestAngleDelta(fromDeg: number, toDeg: number): number {
  return ((toDeg - fromDeg + 540) % 360) - 180;
}

function stepCardBeamAnimation(card: HTMLElement, state: CardBeamState): void {
  const delta = shortestAngleDelta(state.currentAngle, state.targetAngle);

  if (Math.abs(delta) < 0.25) {
    state.currentAngle = state.targetAngle;
    state.rafId = null;
    card.style.setProperty('--border-beam-angle', `${state.currentAngle.toFixed(1)}deg`);
    return;
  }

  // Scale angular speed by how far the cursor is from the center singularity
  const factor = BASE_LERP_FACTOR * Math.max(0.25, state.distanceWeight);
  state.currentAngle = normalizeAngle(state.currentAngle + delta * factor);
  card.style.setProperty('--border-beam-angle', `${state.currentAngle.toFixed(1)}deg`);

  state.rafId = requestAnimationFrame(() => stepCardBeamAnimation(card, state));
}

function updateBeamTargetFromPointer(
  card: HTMLElement,
  e: PointerEvent | MouseEvent,
  snapImmediately: boolean
): void {
  const rect = card.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const halfW = rect.width / 2;
  const halfH = rect.height / 2;
  const dx = e.clientX - (rect.left + halfW);
  const dy = e.clientY - (rect.top + halfH);

  // Normalized radial distance from center (0 = dead center, ~1 = card edge)
  const normDist = Math.hypot(dx / halfW, dy / halfH);

  let state = cardStates.get(card);
  if (!state) {
    state = {
      currentAngle: 0,
      targetAngle: 0,
      distanceWeight: 1,
      rafId: null,
      initialized: false,
    };
    cardStates.set(card, state);
  }

  if (card.classList.contains('border-beam-active')) {
    card.classList.remove('border-beam-active');
    card.style.removeProperty('--beam-delay');
  }

  // Inside the center deadzone, keep the current beam position steady
  // (unless this is the very first pointer contact on an uninitialized card)
  if (normDist < CENTER_DEADZONE && state.initialized) {
    return;
  }

  // Smoothly ramp responsiveness from 0 at the deadzone boundary to 1 near the edge
  const clamped = Math.min(
    1,
    Math.max(0, (normDist - CENTER_DEADZONE) / (FULL_RESPONSE_RADIUS - CENTER_DEADZONE))
  );
  state.distanceWeight = clamped * clamped * (3 - 2 * clamped); // smoothstep

  // CSS conic-gradient 0deg is 12 o'clock (top), increasing clockwise
  const cursorAngleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  const desiredBeamAngle = normalizeAngle(cursorAngleDeg - BEAM_ARC_CENTER_OFFSET_DEG);

  state.targetAngle = desiredBeamAngle;

  if (!state.initialized || snapImmediately) {
    state.currentAngle = desiredBeamAngle;
    state.initialized = true;
    card.style.setProperty('--border-beam-angle', `${state.currentAngle.toFixed(1)}deg`);
    return;
  }

  if (state.rafId === null) {
    state.rafId = requestAnimationFrame(() => stepCardBeamAnimation(card, state));
  }
}

function bindPointerTracking(): void {
  if (pointerTrackingBound || typeof document === 'undefined') return;
  pointerTrackingBound = true;

  let activeCard: HTMLElement | null = null;

  document.addEventListener(
    'pointermove',
    (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const card = target.closest<HTMLElement>(BEAM_SELECTOR);
      if (!card) {
        activeCard = null;
        return;
      }
      const isEnteringCard = card !== activeCard;
      activeCard = card;
      updateBeamTargetFromPointer(card, e, isEnteringCard);
    },
    { passive: true }
  );
}

function initBorderBeamObserver(): void {
  if (typeof window === 'undefined') return;

  bindPointerTracking();

  // Respect user preference for reduced motion on the entrance sweep
  if (!window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  if (activeObserver) {
    activeObserver.disconnect();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      let batchIndex = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const card = entry.target as HTMLElement;
        observer.unobserve(card);

        if (card.dataset.beamAnimated) continue;
        card.dataset.beamAnimated = 'true';

        // Subtle stagger for cards entering in the exact same intersection batch
        const delayMs = Math.min(batchIndex * 100, 300);
        batchIndex++;

        if (delayMs > 0) {
          card.style.setProperty('--beam-delay', `${delayMs}ms`);
        }
        card.classList.add('border-beam-active');

        const cleanup = () => {
          card.classList.remove('border-beam-active');
          card.style.removeProperty('--beam-delay');
        };

        // When mouse hovers, clean up entrance animation immediately so hover tracking takes over cleanly
        card.addEventListener('pointerenter', cleanup, { once: true });

        // Clean up on the next paint frame after the entrance animation completes
        card.addEventListener(
          'animationend',
          (e: AnimationEvent) => {
            if (e.animationName === 'border-beam-entrance') {
              cleanup();
            }
          },
          { once: true }
        );

        // Safety fallback timer: guarantees removal even if hover cancels animationend or frames drop
        setTimeout(cleanup, delayMs + 1300);
      }
    },
    {
      root: null,
      rootMargin: '0px 0px -30px 0px',
      threshold: 0.1,
    }
  );

  activeObserver = observer;

  const cards = document.querySelectorAll<HTMLElement>(BEAM_SELECTOR);
  cards.forEach((card) => {
    if (!card.dataset.beamAnimated) {
      observer.observe(card);
    }
  });
}

// Initialize on DOM ready or immediately if already loaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBorderBeamObserver);
  } else {
    initBorderBeamObserver();
  }
}
