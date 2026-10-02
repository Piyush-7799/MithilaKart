import React from "react";

interface MotifProps {
  className?: string;
  size?: number;
  color?: string;
  secondaryColor?: string;
}

/**
 * MithilaSun - Auspicious concentric radiant sun motif inspired by traditional
 * Madhubani Surya paintings. Features fine circular rings, concentric rays,
 * and delicate geometric hatching.
 */
export const MithilaSun: React.FC<MotifProps> = ({
  className = "",
  size = 64,
  color = "currentColor",
  secondaryColor = "#f59e0b",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mithila-motif mithila-sun ${className}`}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <radialGradient id="sunAura" cx="60" cy="60" r="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.25" />
          <stop offset="70%" stopColor={color} stopOpacity="0.08" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Aura background glow */}
      <circle cx="60" cy="60" r="54" fill="url(#sunAura)" />

      {/* Outer decorative teeth / traditional flame rays */}
      <g stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* 16 primary radiant rays with traditional diamond tips */}
        {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle, idx) => (
          <g key={idx} transform={`rotate(${angle} 60 60)`}>
            <line x1="60" y1="12" x2="60" y2="24" />
            <polygon
              points="60,8 63,16 60,14 57,16"
              fill={secondaryColor}
              stroke={color}
              strokeWidth="0.8"
            />
            {/* Intermediate delicate ray dots */}
            <circle cx="60" cy="4" r="1.5" fill={color} />
          </g>
        ))}

        {/* Concentric sacred circles */}
        <circle cx="60" cy="60" r="34" stroke={color} strokeWidth="1.5" strokeDasharray="2 3" />
        <circle cx="60" cy="60" r="28" stroke={secondaryColor} strokeWidth="1.2" />
        <circle cx="60" cy="60" r="22" stroke={color} strokeWidth="1.5" />
        <circle cx="60" cy="60" r="14" stroke={secondaryColor} strokeWidth="1" strokeDasharray="1.5 2.5" />

        {/* Central serene sun core */}
        <circle cx="60" cy="60" r="8" fill={secondaryColor} fillOpacity="0.4" stroke={color} strokeWidth="1.5" />
        <circle cx="60" cy="60" r="3" fill={color} />
      </g>
    </svg>
  );
};

/**
 * MithilaFish - Dual stylized fish (Matsya) motif, the most celebrated symbol
 * in Mithila art signifying prosperity, fertility, and auspicious beginnings.
 * Detailed with traditional Kachni line-hatching.
 */
export const MithilaFish: React.FC<MotifProps> = ({
  className = "",
  size = 48,
  color = "currentColor",
  secondaryColor = "#d97706",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mithila-motif mithila-fish ${className}`}
      aria-hidden="true"
      role="presentation"
    >
      <g stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {/* Upper Fish curving gracefully */}
        <path
          d="M20 30 C30 20, 50 20, 62 32 C52 38, 38 38, 20 30 Z"
          fill="none"
        />
        {/* Upper fish tail fin */}
        <path d="M20 30 L10 24 C14 29, 14 31, 10 36 Z" fill={secondaryColor} fillOpacity="0.3" />
        {/* Upper fish fins */}
        <path d="M42 22 C44 17, 50 18, 52 23" />
        <path d="M40 37 C42 41, 47 41, 48 36" />
        {/* Eye */}
        <circle cx="56" cy="30" r="2.5" fill={color} />
        <circle cx="56" cy="30" r="1" fill="#fff" />
        {/* Fine body hatching lines (Kachni style) */}
        <path d="M30 27 L33 34" strokeWidth="1" strokeOpacity="0.8" />
        <path d="M36 25 L39 36" strokeWidth="1" strokeOpacity="0.8" />
        <path d="M42 24 L45 36" strokeWidth="1" strokeOpacity="0.8" />
        <path d="M48 26 L50 35" strokeWidth="1" strokeOpacity="0.8" />

        {/* Lower Fish swimming in counter-balance */}
        <path
          d="M60 50 C50 60, 30 60, 18 48 C28 42, 42 42, 60 50 Z"
          fill="none"
        />
        {/* Lower fish tail fin */}
        <path d="M60 50 L70 56 C66 51, 66 49, 70 44 Z" fill={secondaryColor} fillOpacity="0.3" />
        {/* Lower fish fins */}
        <path d="M38 58 C36 63, 30 62, 28 57" />
        <path d="M40 43 C38 39, 33 39, 32 44" />
        {/* Eye */}
        <circle cx="24" cy="50" r="2.5" fill={color} />
        <circle cx="24" cy="50" r="1" fill="#fff" />
        {/* Fine body hatching lines (Kachni style) */}
        <path d="M50 53 L47 46" strokeWidth="1" strokeOpacity="0.8" />
        <path d="M44 55 L41 44" strokeWidth="1" strokeOpacity="0.8" />
        <path d="M38 56 L35 44" strokeWidth="1" strokeOpacity="0.8" />
        <path d="M32 54 L30 45" strokeWidth="1" strokeOpacity="0.8" />
      </g>
    </svg>
  );
};

/**
 * MithilaLotus - Sacred Kamal motif with traditional multi-layered petals
 * and concentric circular Aripan geometry.
 */
export const MithilaLotus: React.FC<MotifProps> = ({
  className = "",
  size = 36,
  color = "currentColor",
  secondaryColor = "#c2410c",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mithila-motif mithila-lotus ${className}`}
      aria-hidden="true"
      role="presentation"
    >
      <g stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        {/* Central Lotus Bud */}
        <path
          d="M30 14 C27 22, 27 34, 30 42 C33 34, 33 22, 30 14 Z"
          fill={secondaryColor}
          fillOpacity="0.22"
        />
        {/* Inner Left Petal */}
        <path
          d="M30 42 C24 38, 19 28, 22 20 C27 24, 29 32, 30 42 Z"
          fill="none"
        />
        {/* Inner Right Petal */}
        <path
          d="M30 42 C36 38, 41 28, 38 20 C33 24, 31 32, 30 42 Z"
          fill="none"
        />
        {/* Outer Left Flared Petal */}
        <path
          d="M29 43 C20 42, 12 34, 14 26 C20 29, 25 36, 29 43 Z"
          fill="none"
        />
        {/* Outer Right Flared Petal */}
        <path
          d="M31 43 C40 42, 48 34, 46 26 C40 29, 35 36, 31 43 Z"
          fill="none"
        />

        {/* Sacred Base Aripan arc and dots */}
        <path d="M16 46 C24 50, 36 50, 44 46" strokeWidth="1.5" />
        <path d="M20 50 C26 53, 34 53, 40 50" strokeDasharray="1.5 2.5" />
        <circle cx="30" cy="46" r="1.5" fill={color} />
        <circle cx="24" cy="45" r="1.2" fill={secondaryColor} />
        <circle cx="36" cy="45" r="1.2" fill={secondaryColor} />
      </g>
    </svg>
  );
};


/**
 * MithilaAripanLine - Geometric line border motif based on traditional
 * Aripan floor art featuring repeated hatched triangles, lotus diamonds, and clean lines.
 */
export const MithilaAripanLine: React.FC<{
  className?: string;
  width?: string | number;
  height?: number;
  color?: string;
  secondaryColor?: string;
}> = ({
  className = "",
  width = "100%",
  height = 14,
  color = "currentColor",
  secondaryColor = "#d97706",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 400 14"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mithila-aripan-line ${className}`}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <pattern id="aripanRepeat" width="40" height="14" patternUnits="userSpaceOnUse">
          {/* Top border line */}
          <line x1="0" y1="2" x2="40" y2="2" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
          {/* Alternating triangle teeth */}
          <polygon points="0,2 10,10 20,2" fill="none" stroke={color} strokeWidth="0.9" />
          <polygon points="20,2 30,10 40,2" fill="none" stroke={color} strokeWidth="0.9" />
          {/* Accent diamond dots */}
          <circle cx="10" cy="5" r="1.2" fill={secondaryColor} />
          <circle cx="30" cy="5" r="1.2" fill={secondaryColor} />
          {/* Bottom border line */}
          <line x1="0" y1="12" x2="40" y2="12" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
        </pattern>
      </defs>
      <rect width="400" height="14" fill="url(#aripanRepeat)" />
    </svg>
  );
};
