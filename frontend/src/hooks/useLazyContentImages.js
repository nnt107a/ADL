import { useEffect } from 'react';

export default function useLazyContentImages(containerRef, contentDependency) {
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) {
      return undefined;
    }

    const lazyImages = Array.from(container.querySelectorAll('img.lazy-content-img[data-lazy-src]'));

    if (lazyImages.length === 0) {
      return undefined;
    }

    // Fallback if IntersectionObserver is missing
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      lazyImages.forEach((img) => {
        const targetSrc = img.getAttribute('data-lazy-src');
        if (targetSrc) {
          img.src = targetSrc;
          img.classList.add('is-loaded');
          img.removeAttribute('data-lazy-src');
        }
      });
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const targetSrc = img.getAttribute('data-lazy-src');

            if (targetSrc) {
              img.onload = () => {
                img.classList.add('is-loaded');
              };
              img.src = targetSrc;
              img.removeAttribute('data-lazy-src');
            } else {
              img.classList.add('is-loaded');
            }

            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '300px 0px',
        threshold: 0.01,
      }
    );

    lazyImages.forEach((img) => observer.observe(img));

    return () => {
      lazyImages.forEach((img) => observer.unobserve(img));
    };
  }, [containerRef, contentDependency]);
}
