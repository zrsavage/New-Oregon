import type { Role } from "../../types/game";

/** Builds an SVG polygon `points` string for a regular star. */
function starPoints(cx: number, cy: number, outerR: number, innerR: number, spikes = 5): string {
  const pts: string[] = [];
  const step = Math.PI / spikes;
  let angle = -Math.PI / 2;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`);
    angle += step;
  }
  return pts.join(" ");
}

/** A small flat glyph representing a party role, drawn from plain SVG primitives (no icon font/library). */
export default function RoleIcon({ role, className }: { role: Role; className?: string }) {
  const common = { className, viewBox: "0 0 24 24", fill: "currentColor" } as const;

  switch (role) {
    case "leader":
      return (
        <svg {...common}>
          <polygon points={starPoints(12, 12, 9, 3.8)} />
        </svg>
      );
    case "scout":
      return (
        <svg {...common}>
          <rect x="6" y="9" width="12" height="3" rx="1" />
          <circle cx="8" cy="15" r="4.2" />
          <circle cx="16" cy="15" r="4.2" />
        </svg>
      );
    case "hunter":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="12" y1="1.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="2" />
          <line x1="12" y1="17.5" x2="12" y2="22.5" stroke="currentColor" strokeWidth="2" />
          <line x1="1.5" y1="12" x2="6.5" y2="12" stroke="currentColor" strokeWidth="2" />
          <line x1="17.5" y1="12" x2="22.5" y2="12" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="1.6" />
        </svg>
      );
    case "wainwright":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <circle cx="12" cy="12" r="2" />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x2 = 12 + Math.cos(rad) * 8.3;
            const y2 = 12 + Math.sin(rad) * 8.3;
            return <line key={deg} x1="12" y1="12" x2={x2} y2={y2} stroke="currentColor" strokeWidth="2" />;
          })}
        </svg>
      );
    case "healer":
      return (
        <svg {...common}>
          <rect x="9.5" y="3" width="5" height="18" rx="1.4" />
          <rect x="3" y="9.5" width="18" height="5" rx="1.4" />
        </svg>
      );
    case "cook":
      return (
        <svg {...common}>
          <rect x="6" y="10" width="12" height="9" rx="1.5" />
          <ellipse cx="12" cy="10" rx="7" ry="2.2" />
          <rect x="2.5" y="12" width="3.2" height="2.4" rx="1" />
          <rect x="18.3" y="12" width="3.2" height="2.4" rx="1" />
        </svg>
      );
    case "teamster":
      return (
        <svg {...common}>
          <path
            d="M6,20 L6,13 A6,6 0 0 1 18,13 L18,20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "farmer":
      return (
        <svg {...common}>
          <line x1="12" y1="21" x2="12" y2="5" stroke="currentColor" strokeWidth="1.8" />
          {[7, 10, 13, 16].map((y) => (
            <g key={y}>
              <line x1="12" y1={y} x2={12 - (18 - y)} y2={y - 2.5} stroke="currentColor" strokeWidth="1.6" />
              <line x1="12" y1={y} x2={12 + (18 - y)} y2={y - 2.5} stroke="currentColor" strokeWidth="1.6" />
            </g>
          ))}
        </svg>
      );
    case "merchant":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <text x="12" y="16.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--paper, #f2e6cd)">
            $
          </text>
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
