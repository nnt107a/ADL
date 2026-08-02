import { useEffect, useMemo, useState } from 'react';

export default function HeroSlider({ slides }) {
  const [activeSlide, setActiveSlide] = useState(0);

  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 7000);

    return () => window.clearInterval(intervalId);
  }, [reduceMotion, slides.length]);

  const slide = slides[activeSlide];

  return (
    <section id="home" className="hero">
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        tabIndex={-1}
        preload="auto"
      >
        <source src="/Enhancer-HD-bg_vid.mp4" type="video/mp4" />
      </video>

      <div className="container hero-grid hero-grid-single">
        <div className="hero-copy hero-copy-centered">
          <div className="hero-pagination">
            <div
              className="slide-controls hero-slide-controls"
              aria-label="Hero messages"
            >
              {slides.map((item, index) => (
                <button
                  key={item.status}
                  className={`slide-button ${index === activeSlide ? 'is-active' : ''}`}
                  type="button"
                  aria-pressed={index === activeSlide}
                  onClick={() => setActiveSlide(index)}
                >
                  {String(index + 1).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          <div className={slide.compact ? 'hero-message hero-message--compact' : 'hero-message'}>
            <div className="hero-title-shell">
              <h1>{slide.title}</h1>
            </div>

            {slide.description && (
              <p className="hero-description">
                {slide.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
