import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface VehicleIllustrationProps {
  type: 'two_wheeler' | 'hatchback' | 'ev';
  className?: string;
}

// Real, background-removed studio photography for each vehicle class.
// Files live in /client/public/vehicles/ (served from the app root as /vehicles/*.png).
const VEHICLE_PHOTOS: Record<VehicleIllustrationProps['type'], { src: string; alt: string; ground: number }> = {
  two_wheeler: {
    src: '/vehicles/two_wheeler.png',
    alt: 'Studio side-profile photo of a high-performance motorcycle, background removed',
    ground: 92,
  },
  hatchback: {
    src: '/vehicles/hatchback.png',
    alt: 'Studio photo of a compact 4x4 city SUV, background removed',
    ground: 88,
  },
  ev: {
    src: '/vehicles/ev.png',
    alt: 'Studio photo of a streamlined electric SUV concept, background removed',
    ground: 90,
  },
};

/**
 * VehicleIllustration
 *
 * Renders the real cut-out vehicle photograph (transparent PNG) for the given class,
 * with a soft contact shadow and a subtle GSAP-powered idle float + sheen sweep so it
 * reads as a "hero product shot" rather than a static image. Respects prefers-reduced-motion.
 */
export const VehicleIllustration: React.FC<VehicleIllustrationProps> = ({ type, className = '' }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const photo = VEHICLE_PHOTOS[type];

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (prefersReduced) return;

      // Gentle perpetual float, as if the car is hovering just above the curb.
      if (imgRef.current) {
        gsap.to(imgRef.current, {
          y: -8,
          duration: 2.6,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      }

      // A slow diagonal light sheen sweeping across the body on load.
      if (sheenRef.current) {
        gsap.fromTo(
          sheenRef.current,
          { xPercent: -140, opacity: 0 },
          {
            xPercent: 140,
            opacity: 0.55,
            duration: 1.4,
            ease: 'power2.out',
            delay: 0.15,
            onComplete: () => gsap.set(sheenRef.current, { opacity: 0 }),
          }
        );
      }
    }, wrapRef);

    return () => ctx.revert();
  }, [type]);

  return (
    <div ref={wrapRef} className={`relative w-full select-none ${className}`}>
      {/* Contact shadow grounding the vehicle */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-[50%] bg-black/55 blur-2xl"
        style={{
          top: `${photo.ground}%`,
          width: '72%',
          height: '9%',
        }}
        aria-hidden="true"
      />

      <div className="relative overflow-hidden">
        <img
          ref={imgRef}
          src={photo.src}
          alt={photo.alt}
          className="w-full h-auto object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.55)]"
          draggable={false}
          loading="eager"
          decoding="async"
        />
        {/* Sheen sweep overlay, masked to the vehicle silhouette via mix-blend */}
        <div
          ref={sheenRef}
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{
            background:
              'linear-gradient(115deg, transparent 35%, rgba(45,212,191,0.55) 48%, rgba(255,255,255,0.85) 50%, rgba(45,212,191,0.55) 52%, transparent 65%)',
            mixBlendMode: 'screen',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
