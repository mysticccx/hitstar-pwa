import React from 'react';

export default function AnimatedBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Das SVG füllt den gesamten Bildschirm aus */}
      <svg className="w-full h-full opacity-15">
        <defs>
          {/* Hier definieren wir die 120x120px Kachel */}
          <pattern
            id="hitster-grid"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
            className="animate-svg-scroll"
          >
            {/* Icon 1: Minimalistische Schallplatte (oben links) */}
            <g transform="translate(15, 15)" fill="none" stroke="#10b981" strokeWidth="2">
              <circle cx="15" cy="15" r="13" />
              <circle cx="15" cy="15" r="4" />
              <path d="M15 6 A9 9 0 0 1 24 15" />
            </g>

            {/* Icon 2: Musiknote (unten rechts versetzt) */}
            <g transform="translate(75, 75)" fill="none" stroke="#10b981" strokeWidth="2">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </g>
          </pattern>
        </defs>

        {/* Dieses Rechteck spannt das Muster über die gesamte Bildschirmfläche */}
        <rect width="100%" height="100%" fill="url(#hitster-grid)" />
      </svg>
    </div>
  );
}
