/**
 * Defines reusable SVG filters once at the app root. Any inline SVG anywhere
 * in the document can reference them via `filter="url(#sketchy-ink)"` (or the
 * `.sketchy-ink` CSS class) since SVG filter ids resolve document-wide, not
 * just within their own <svg>. Gives flat procedural shapes a wobbly,
 * hand-inked edge instead of a crisp computer-drawn one.
 */
export default function SketchyFilters() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <filter id="sketchy-ink" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045 0.09" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="sketchy-ink-bold" x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03 0.07" numOctaves="2" seed="11" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* Tuned for large-coordinate-space illustrations (e.g. the ~1000-unit-wide trail map), where the
            same baseFrequency as the small icon filters would read as fine static rather than a gentle wobble. */}
        <filter id="sketchy-ink-wide" x="-5%" y="-40%" width="110%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.03" numOctaves="2" seed="5" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
