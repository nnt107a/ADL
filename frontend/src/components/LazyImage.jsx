import { useEffect, useRef, useState } from 'react';

export default function LazyImage({
  src,
  alt = '',
  className = '',
  style = {},
  placeholderClassName = '',
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) {
      return undefined;
    }

    // Fallback if IntersectionObserver is not supported
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return undefined;
    }

    const element = imgRef.current;
    if (!element) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '200px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [src]);

  return (
    <div
      ref={imgRef}
      className={`lazy-image-container ${isLoaded ? 'is-loaded' : 'is-loading'} ${className}`.trim()}
      style={style}
    >
      {!isLoaded && <div className={`lazy-image-skeleton ${placeholderClassName}`.trim()} aria-hidden="true" />}
      {isVisible && src ? (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`lazy-image-el ${isLoaded ? 'lazy-image-loaded' : 'lazy-image-hidden'}`}
          decoding="async"
          {...props}
        />
      ) : null}
    </div>
  );
}
