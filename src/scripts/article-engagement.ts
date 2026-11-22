/**
 * Progressive Enhancement: genuine article-read dwell/scroll tracking and
 * declarative `[data-track-event]` click delegation via `window.__trackUmami`.
 *
 * Self-contained with zero shared imports so `post-build-html` can bundle/inline cleanly.
 */

(() => {
  function initArticleReadTracking(): void {
    const articleEl = document.querySelector('article');
    if (!articleEl) return;

    let dwellSeconds = 0;
    let fired = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const cleanup = (): void => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };

    const checkEngagement = (): void => {
      if (fired || dwellSeconds < 30) return;

      const rect = articleEl.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const progress = (window.scrollY + window.innerHeight - articleTop) / Math.max(rect.height, 1);

      if (progress >= 0.75) {
        fired = true;
        cleanup();
        window.__trackUmami?.('article-read', {
          path: window.location.pathname,
          dwellSeconds,
        });
      }
    };

    const onScroll = (): void => checkEngagement();
    const onResize = (): void => checkEngagement();
    const onVisibilityChange = (): void => checkEngagement();

    intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        dwellSeconds += 1;
        checkEngagement();
      }
    }, 1000);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
  }

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const el = target?.closest<HTMLElement>('[data-track-event]');
    if (!el) return;

    const eventName = el.dataset.trackEvent;
    if (!eventName) return;

    window.__trackUmami?.(eventName, {
      target: el.dataset.trackLabel || el.getAttribute('href') || '',
      path: window.location.pathname,
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArticleReadTracking, { once: true });
  } else {
    initArticleReadTracking();
  }
})();
