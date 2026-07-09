"use client";

/** Two-thumb range slider for selecting a [low, high] band. */
export function DualRange({
  min,
  max,
  step,
  low,
  high,
  onChange
}: {
  min: number;
  max: number;
  step: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
}) {
  const range = max - min || 1;
  const lowPct = ((low - min) / range) * 100;
  const highPct = ((high - min) / range) * 100;

  return (
    <div className="dual-range">
      <div className="dual-range-track" />
      <div
        className="dual-range-active"
        style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={low}
        onChange={(e) => onChange(Math.min(Number(e.target.value), high), high)}
        // Raise above the other thumb when near the top end so it stays grabbable.
        style={{ zIndex: lowPct > 90 ? 5 : 3 }}
        aria-label="Minimum"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={high}
        onChange={(e) => onChange(low, Math.max(Number(e.target.value), low))}
        style={{ zIndex: 4 }}
        aria-label="Maximum"
      />
    </div>
  );
}
