import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { useTheme } from '../context/ThemeContext';
import { COUNTRY_COORDS } from '../lib/countryGeo';

interface CountryFocusGlobeProps {
  isoAlpha3: string;
  committed: number;
  disbursed: number;
  remaining: number;
}

const RING_SIZE = 280;
const STROKE = 10;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const CountryFocusGlobe: React.FC<CountryFocusGlobeProps> = ({ isoAlpha3, committed, disbursed, remaining }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const coords = COUNTRY_COORDS[isoAlpha3]?.location ?? [0, 0];

  const disbursedPct = committed > 0 ? Math.min(1, disbursed / committed) : 0;
  const remainingPct = committed > 0 ? Math.min(1 - disbursedPct, remaining / committed) : 0;
  const disbursedLen = CIRCUMFERENCE * disbursedPct;
  const remainingLen = CIRCUMFERENCE * remainingPct;

  useEffect(() => {
    let width = 0;
    const onResize = () => {
      if (wrapperRef.current) width = wrapperRef.current.offsetWidth;
    };
    window.addEventListener('resize', onResize);
    onResize();

    const dark = theme === 'dark';
    // Orient the camera to face the country's marker and hold it there — no auto-rotation.
    const focusPhi = (-coords[1] * Math.PI) / 180;
    const focusTheta = (coords[0] * Math.PI) / 180;

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: focusPhi,
      theta: focusTheta,
      dark: dark ? 1 : 0,
      diffuse: 1.4,
      mapSamples: 16000,
      mapBrightness: dark ? 6 : 3.5,
      baseColor: dark ? [0.25, 0.25, 0.28] : [0.85, 0.85, 0.88],
      markerColor: [0.06, 0.73, 0.51],
      glowColor: dark ? [0.15, 0.3, 0.25] : [0.6, 0.85, 0.75],
      markers: [{ location: coords, size: 0.1 }],
    });

    // cobe only paints inside update(); keep feeding it the same fixed
    // orientation every frame so it renders without ever rotating.
    let frame: number;
    const render = () => {
      globe.update({ phi: focusPhi, theta: focusTheta, width: width * 2, height: width * 2 });
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    if (canvasRef.current) {
      setTimeout(() => {
        if (canvasRef.current) canvasRef.current.style.opacity = '1';
      });
    }

    return () => {
      cancelAnimationFrame(frame);
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [theme, coords]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[220px] lg:max-w-[280px]">
      <svg viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} fill="none" stroke="var(--border)" strokeWidth={STROKE} />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#10b981"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${disbursedLen} ${CIRCUMFERENCE - disbursedLen}`}
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${remainingLen} ${CIRCUMFERENCE - remainingLen}`}
          strokeDashoffset={-disbursedLen}
        />
      </svg>
      <div ref={wrapperRef} className="absolute inset-0 m-[14%]">
        <canvas
          ref={canvasRef}
          className="h-full w-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]"
        />
      </div>
    </div>
  );
};
