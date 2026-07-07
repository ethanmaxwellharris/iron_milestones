/**
 * Fixed background plate: the Vitruvian construction — circle, inscribed
 * square, radial proportion lines — drawn faintly behind the whole app,
 * like a da Vinci study printed on the endpaper of an encyclopedia.
 */
export function VitruvianBackdrop() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed left-1/2 top-1/2 -z-10 h-[140vmin] w-[140vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"
      viewBox="0 0 400 400"
      fill="none"
      stroke="#eee3c6"
      strokeWidth="0.75"
    >
      <circle cx="200" cy="200" r="150" />
      <circle cx="200" cy="200" r="110" strokeDasharray="2 5" />
      <rect x="94" y="94" width="212" height="212" />
      <line x1="200" y1="20" x2="200" y2="380" />
      <line x1="20" y1="200" x2="380" y2="200" />
      <line x1="73" y1="73" x2="327" y2="327" />
      <line x1="327" y1="73" x2="73" y2="327" />
      {/* proportion ticks along the vertical axis */}
      {[80, 120, 160, 240, 280, 320].map((y) => (
        <line key={y} x1="192" y1={y} x2="208" y2={y} />
      ))}
      {/* radial arm lines, as in the four-armed figure */}
      <line x1="200" y1="200" x2="60" y2="140" strokeDasharray="3 4" />
      <line x1="200" y1="200" x2="340" y2="140" strokeDasharray="3 4" />
      <line x1="200" y1="200" x2="60" y2="260" strokeDasharray="3 4" />
      <line x1="200" y1="200" x2="340" y2="260" strokeDasharray="3 4" />
      <circle cx="200" cy="200" r="4" fill="#eee3c6" stroke="none" />
      {/* a barbell across the golden section, because this is still a gym */}
      <line x1="110" y1="307" x2="290" y2="307" strokeWidth="2" />
      <rect x="118" y="296" width="10" height="22" />
      <rect x="272" y="296" width="10" height="22" />
    </svg>
  );
}
