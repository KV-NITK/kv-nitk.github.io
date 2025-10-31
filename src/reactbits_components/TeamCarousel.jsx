import React, { useEffect, useMemo, useRef, useState } from 'react';

function TeamCard({ image, name, title }) {
  const src = useMemo(() => {
    if (!image) return '/team/placeholder.png';
    if (image.startsWith('http') || image.startsWith('/')) return image;
    return `/team/${image}`;
  }, [image]);

  return (
    <div className="px-3">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <img src={src} alt={name} className="w-full h-56 object-cover" />
        <div className="p-4">
          <div className="text-lg font-semibold leading-tight">{name}</div>
          <div className="text-sm text-muted-foreground">{title}</div>
        </div>
      </div>
    </div>
  );
}

export default function TeamCarousel({ items = [], autoplay = true, intervalMs = 3000, pauseOnHover = true, continuous = true, speedPx = 1.2 }) {
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(3);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [offsetPx, setOffsetPx] = useState(0);

  useEffect(() => {
    function updatePerView() {
      const isPhone = window.matchMedia('(max-width: 640px)').matches;
      setPerView(isPhone ? 2 : 3);
    }
    updatePerView();
    window.addEventListener('resize', updatePerView);
    return () => window.removeEventListener('resize', updatePerView);
  }, []);

  const maxIndex = Math.max(0, items.length - perView);
  const clampedIndex = Math.min(index, maxIndex);
  useEffect(() => {
    if (index !== clampedIndex) setIndex(clampedIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perView, items.length]);

  function prev() {
    setIndex((i) => (i <= 0 ? maxIndex : i - 1));
  }
  function next() {
    setIndex((i) => (i >= maxIndex ? 0 : i + 1));
  }

  // Autoplay
  useEffect(() => {
    if (continuous) return; // handled by RAF below
    if (!autoplay) return;
    if (items.length === 0) return;
    if (items.length <= perView) return;
    if (pauseOnHover && paused) return;
    const id = setInterval(() => {
      next();
    }, intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, intervalMs, paused, perView, items.length, maxIndex, continuous]);

  // Continuous smooth marquee scrolling using requestAnimationFrame
  useEffect(() => {
    if (!continuous) return;
    if (items.length === 0) return;
    if (pauseOnHover && paused) return;

    let rafId;
    const step = () => {
      const track = trackRef.current;
      if (!track) {
        rafId = requestAnimationFrame(step);
        return;
      }
      const trackWidth = track.scrollWidth;
      const halfWidth = trackWidth / 2; // items duplicated
      setOffsetPx((prev) => {
        let next = prev + speedPx; // move left by increasing offset; we apply negative transform
        if (next >= halfWidth) next = 0;
        return next;
      });
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [continuous, items.length, paused, pauseOnHover, speedPx]);

  const translatePct = -(clampedIndex * (100 / perView));
  const doubled = useMemo(() => [...items, ...items], [items]);

  return (
    <div className="w-full" ref={containerRef} onMouseEnter={() => pauseOnHover && setPaused(true)} onMouseLeave={() => pauseOnHover && setPaused(false)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-extrabold tracking-tight">Our Team</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            className="h-9 w-9 rounded-md border bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            disabled={clampedIndex === 0}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            className="h-9 w-9 rounded-md border bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            disabled={clampedIndex === maxIndex}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className={continuous ? "flex will-change-transform" : "flex transition-transform duration-300"}
          style={continuous ? { transform: `translateX(${-offsetPx}px)` } : { width: `${(items.length * 100) / perView}%`, transform: `translateX(${translatePct}%)` }}
        >
          {(continuous ? doubled : items).map((item, idx) => (
            <div key={`${item.name}-${idx}`} style={{ width: `${100 / perView}%` }} className="shrink-0">
              <TeamCard image={item.image} name={item.name} title={item.title} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


