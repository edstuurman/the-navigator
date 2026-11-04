let globalDismissBound = false;

/**
 * Interactive Viewport Collision Clamping & Accessibility Management for Technical Tooltips
 * (Tooltip markup and dictionary definitions are compiled statically at build time).
 */
export function initTechTooltips(): void {
  const allWrappers = document.querySelectorAll<HTMLElement>('.tech-tooltip-wrapper');
  allWrappers.forEach((wrapper) => {
    if (wrapper.dataset.tooltipBound === 'true') return;

    const trigger = wrapper.querySelector<HTMLElement>('.tech-tooltip-trigger');
    const bubble = wrapper.querySelector<HTMLElement>('.tech-tooltip-bubble');
    if (!trigger || !bubble) return;

    wrapper.dataset.tooltipBound = 'true';

    // Preserve native title for screen readers / fallbacks without duplicate OS popup
    const originalTitle = trigger.getAttribute('title') || '';
    if (originalTitle && !trigger.getAttribute('data-original-title')) {
      trigger.setAttribute('data-original-title', originalTitle);
    }

    const showTooltip = () => {
      // Temporarily remove native title to prevent default yellow browser bubble clash
      const saved = trigger.getAttribute('data-original-title');
      if (saved) trigger.removeAttribute('title');

      // Viewport collision checking
      const triggerRect = trigger.getBoundingClientRect();
      const bubbleHeight = 120; // approximate bubble height
      const spaceAbove = triggerRect.top;

      if (spaceAbove < bubbleHeight + 20) {
        bubble.classList.add('is-flipped');
      } else {
        bubble.classList.remove('is-flipped');
      }

      // Check horizontal bounds against container and viewport
      const viewportWidth = window.innerWidth;
      const bubbleWidth = bubble.offsetWidth || 300;
      const triggerCenter = triggerRect.left + triggerRect.width / 2;

      // Viewport bounds
      const minViewportLeft = 12;
      const maxViewportRight = viewportWidth - 12;

      // Card / container bounds
      const container = trigger.closest<HTMLElement>('.border-beam-card, .prose, article, main');
      let minLeft = minViewportLeft;
      let maxRight = maxViewportRight;

      if (container) {
        const containerRect = container.getBoundingClientRect();
        if (containerRect.width >= bubbleWidth + 24) {
          minLeft = Math.max(minViewportLeft, containerRect.left + 12);
          maxRight = Math.min(maxViewportRight, containerRect.right - 12);
        }
      }

      let offset = 0;
      const leftEdge = triggerCenter - bubbleWidth / 2;
      const rightEdge = triggerCenter + bubbleWidth / 2;

      if (leftEdge < minLeft) {
        offset = minLeft - leftEdge;
      } else if (rightEdge > maxRight) {
        offset = maxRight - rightEdge;
      }

      // Ensure clamped offset doesn't push left edge outside viewport
      const clampedLeft = leftEdge + offset;
      if (clampedLeft < minViewportLeft) {
        offset += minViewportLeft - clampedLeft;
      }

      if (offset !== 0) {
        bubble.style.setProperty('--tooltip-x-offset', `calc(-50% + ${offset}px)`);
      } else {
        bubble.style.removeProperty('--tooltip-x-offset');
      }

      // Position arrow so it always points precisely at trigger center
      const arrow = bubble.querySelector<HTMLElement>('.tech-tooltip-arrow');
      if (arrow) {
        if (offset !== 0) {
          const arrowOffset = Math.max(16, Math.min(bubbleWidth - 16, bubbleWidth / 2 - offset));
          arrow.style.left = `${arrowOffset}px`;
        } else {
          arrow.style.left = '50%';
        }
      }
    };

    const hideTooltip = () => {
      const saved = trigger.getAttribute('data-original-title');
      if (saved) trigger.setAttribute('title', saved);
      bubble.classList.remove('is-active');
      bubble.style.removeProperty('--tooltip-x-offset');
      const arrow = bubble.querySelector<HTMLElement>('.tech-tooltip-arrow');
      if (arrow) arrow.style.removeProperty('left');
    };

    // Mouse listeners
    trigger.addEventListener('mouseenter', showTooltip);
    trigger.addEventListener('mouseleave', hideTooltip);

    // Keyboard focus listeners
    trigger.addEventListener('focus', showTooltip);
    trigger.addEventListener('blur', hideTooltip);

    // Escape key dismissal
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideTooltip();
        trigger.blur();
      }
    });

    // Touch support (tap to toggle)
    trigger.addEventListener('click', (e) => {
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      if (isTouch) {
        e.preventDefault();
        const isActive = bubble.classList.contains('is-active');
        document.querySelectorAll('.tech-tooltip-bubble.is-active').forEach((b) => {
          b.classList.remove('is-active');
        });
        if (!isActive) {
          showTooltip();
          bubble.classList.add('is-active');
        } else {
          hideTooltip();
        }
      }
    });
  });

  // Global dismiss on click outside (bound once per page session)
  if (!globalDismissBound) {
    globalDismissBound = true;
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest('.tech-tooltip-wrapper')) {
        document.querySelectorAll('.tech-tooltip-bubble.is-active').forEach((b) => {
          b.classList.remove('is-active');
        });
      }
    });
  }
}

// Auto-run on client
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTechTooltips);
  } else {
    initTechTooltips();
  }
}

