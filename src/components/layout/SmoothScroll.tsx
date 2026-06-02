'use client';

import { ReactNode, useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    // Expose lenis instance globally for programmatics from Navbar and buttons
    (window as unknown as { lenis: typeof lenis }).lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Keyboard Arrow Key Navigation (Smooth full-page scroll transitions)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        // Bypass if user is actively typing in inputs/textareas
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea') {
          return;
        }

        e.preventDefault();

        // Standard sections on our scrollytelling path
        const sectionIds = ['hero', 'origin', 'flavors', 'process', 'testimonials', 'contact'];
        const sectionElements = sectionIds
          .map(id => document.getElementById(id))
          .filter((el): el is HTMLElement => el !== null);

        if (sectionElements.length === 0) return;

        // Determine current active section closest to viewport top
        let currentSectionIndex = 0;
        let minDiff = Infinity;

        sectionElements.forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          const diff = Math.abs(rect.top);
          if (diff < minDiff) {
            minDiff = diff;
            currentSectionIndex = index;
          }
        });

        // Compute next section index based on arrow direction
        let targetIndex = currentSectionIndex;
        if (e.key === 'ArrowDown') {
          targetIndex = Math.min(currentSectionIndex + 1, sectionElements.length - 1);
        } else if (e.key === 'ArrowUp') {
          targetIndex = Math.max(currentSectionIndex - 1, 0);
        }

        const targetElement = sectionElements[targetIndex];
        if (targetElement) {
          // Trigger the targeted section to reload dynamically
          window.dispatchEvent(
            new CustomEvent('trigger-section-load', { detail: { id: targetElement.id } })
          );

          lenis.scrollTo(targetElement, {
            offset: 0,
            duration: 1.4,
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });

    return () => {
      lenis.destroy();
      // Clean up global references
      if ((window as unknown as { lenis?: unknown }).lenis === lenis) {
        delete (window as unknown as { lenis?: unknown }).lenis;
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <>{children}</>;
}
