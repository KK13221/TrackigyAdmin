// TrackifyLoader — progress-fill wordmark loader (React)
//
// Usage:
//   <TrackifyLoader progress={65} message="Loading fleet data..." animated={false} />
//   <TrackifyLoader animated message="Syncing fleet..." />   // auto-loops demo
//
// Setup: keep trackify-wordmark.png next to this file (or update the import
// path below to wherever you place it in your project).

import React, { useEffect, useRef, useState } from 'react';
import wordmark from './trackify-wordmark.png';

export default function TrackifyLoader({
  progress: controlledProgress = 0,
  size = 260,
  message = 'Loading fleet data...',
  showPercentage = true,
  animated = false,
  transitionMs = 400,
}) {
  const [progress, setProgress] = useState(animated ? 0 : controlledProgress);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!animated) {
      setProgress(controlledProgress);
      return;
    }
    const stops = [0, 25, 50, 75, 100];
    let i = 0;
    setProgress(0);
    timerRef.current = setInterval(() => {
      i = (i + 1) % stops.length;
      setProgress(stops[i]);
      if (stops[i] === 100) {
        setTimeout(() => {
          i = 0;
          setProgress(0);
        }, 1400);
      }
    }, 900);
    return () => clearInterval(timerRef.current);
  }, [animated, controlledProgress]);

  const height = Math.round(size * (292 / 793));
  const clamped = Math.max(0, Math.min(100, progress));
  const rightInset = 100 - clamped;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ position: 'relative', width: size, height }}>
        <img
          src={wordmark}
          alt=""
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'contain', filter: 'grayscale(1)', opacity: 0.4,
            mixBlendMode: 'multiply',
          }}
        />
        <img
          src={wordmark}
          alt="Trackify"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'contain',
            mixBlendMode: 'multiply',
            clipPath: `inset(0 ${rightInset}% 0 0)`,
            transition: `clip-path ${transitionMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            filter: clamped >= 100 ? 'drop-shadow(0 0 14px rgba(0,184,230,0.45))' : 'none',
          }}
        />
      </div>
      {showPercentage && (
        <div style={{ fontSize: 24, fontWeight: 700, color: '#0091C9' }}>{Math.round(clamped)}%</div>
      )}
      {message && <div style={{ fontSize: 14, color: '#6B7280' }}>{message}</div>}
    </div>
  );
}
