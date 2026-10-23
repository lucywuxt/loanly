import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { Landmark, CheckCircle2, Layers } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { COUNTRY_COORDS } from '../lib/countryGeo';
import { Card } from './ui/card';

interface CountryFocusGlobeProps {
  isoAlpha3: string;
  countryName: string;
  committed: number;
  disbursed: number;
  projectCount: number;
}

export const CountryFocusGlobe: React.FC<CountryFocusGlobeProps> = ({
  isoAlpha3,
  countryName,
  committed,
  disbursed,
  projectCount,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const phiRef = useRef(0);
  const { theme } = useTheme();

  const coords = COUNTRY_COORDS[isoAlpha3]?.location ?? [0, 0];

  useEffect(() => {
    let width = 0;
    const onResize = () => {
      if (wrapperRef.current) width = wrapperRef.current.offsetWidth;
    };
    window.addEventListener('resize', onResize);
    onResize();

    const dark = theme === 'dark';
    // Orient the camera to roughly face the country's marker on mount.
    const focusPhi = (-coords[1] * Math.PI) / 180;
    const focusTheta = (coords[0] * Math.PI) / 180;
    phiRef.current = focusPhi;

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: focusPhi,
      theta: focusTheta,
      dark: dark ? 1 : 0,
      diffuse: 1.4,
      mapSamples: 14000,
      mapBrightness: dark ? 6 : 3.5,
      baseColor: dark ? [0.25, 0.25, 0.28] : [0.85, 0.85, 0.88],
      markerColor: [0.06, 0.73, 0.51],
      glowColor: dark ? [0.15, 0.3, 0.25] : [0.6, 0.85, 0.75],
      markers: [{ location: coords, size: 0.09 }],
    });

    let frame: number;
    const animate = () => {
      phiRef.current += 0.0015;
      globe.update({ phi: phiRef.current, theta: focusTheta, width: width * 2, height: width * 2 });
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

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
    <Card className="flex flex-col items-center gap-4 p-4 sm:flex-row sm:items-center">
      <div ref={wrapperRef} className="relative aspect-square w-full max-w-[160px] shrink-0">
        <canvas
          ref={canvasRef}
          className="h-full w-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]"
        />
      </div>
      <div className="flex-1">
        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{countryName} Portfolio</div>
        <div className="mt-2 grid grid-cols-3 gap-3">
          <div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground"><Landmark className="h-3 w-3" /> Committed</div>
            <div className="font-mono text-sm font-semibold text-foreground">${committed.toLocaleString()}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground"><CheckCircle2 className="h-3 w-3" /> Disbursed</div>
            <div className="font-mono text-sm font-semibold text-emerald-400">${disbursed.toLocaleString()}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground"><Layers className="h-3 w-3" /> Projects</div>
            <div className="font-mono text-sm font-semibold text-foreground">{projectCount}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
