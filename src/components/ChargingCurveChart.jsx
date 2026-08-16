import { useState } from "react";
import { taperedPowerAt } from "../utils/calculations";

const COLORS = {
  lime: "#7ccb00",
  navy: "#071d34",
  amber: "#f59e0b",
};

/**
 * Charging speed (kW) vs battery percentage (SoC) line chart, drawn from the
 * taper curve. X = 0–100% battery, Y = power the battery accepts. A charger's
 * output is capped both by the Y-axis scale (`maxKw`) and the vehicle's own
 * charging limit (`vehicleMaxKw`). Curves that become identical after capping
 * are collapsed into a single line. Hover the chart to probe the speed at any
 * battery percentage.
 */
export default function ChargingCurveChart({ curves, maxKw = 180, height = 280, vehicleMaxKw }) {
  const [hover, setHover] = useState(null);

  const W = 560;
  const H = height;
  const pad = { l: 44, r: 14, t: 14, b: 30 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const yMax = Math.max(1, maxKw || 1);

  const x = (soc) => pad.l + (soc / 100) * iw;
  const y = (kw) => pad.t + ih - (kw / yMax) * ih;

  const limit = vehicleMaxKw && vehicleMaxKw > 0 ? vehicleMaxKw : yMax;
  const capped = curves.map((c) => ({
    ...c,
    power: Math.min(c.power, limit),
    capped: c.power > limit,
  }));
  const seen = new Set();
  const visible = capped.filter((c) => {
    const key = Math.round(c.power);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const soc = ((px - pad.l) / iw) * 100;
    setHover(Math.min(100, Math.max(0, soc)));
  };

  const gridY = [0, 0.25, 0.5, 0.75, 1].map((f) => yMax * f);
  const gridX = [0, 25, 50, 75, 100];
  const hoverX = hover != null ? x(hover) : null;
  const hoverLeftPct = hoverX != null ? (hoverX / W) * 100 : 0;
  const flipTip = hoverX != null && hoverX > W - 140;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full select-none"
        role="img"
        aria-label="Charging speed in kilowatts versus battery percentage"
        onPointerMove={handleMove}
        onPointerLeave={() => setHover(null)}
      >
        {gridY.map((kw) => (
          <g key={kw}>
            <line x1={pad.l} x2={W - pad.r} y1={y(kw)} y2={y(kw)} stroke="#e5edf2" strokeWidth="1" />
            <text x={pad.l - 6} y={y(kw) + 3} textAnchor="end" fontSize="10" fill="#8b9bad">
              {Math.round(kw)} kW
            </text>
          </g>
        ))}
        {gridX.map((s) => (
          <g key={s}>
            <line x1={x(s)} x2={x(s)} y1={pad.t} y2={H - pad.b} stroke="#e5edf2" strokeWidth="1" />
            <text x={x(s)} y={H - pad.b + 16} textAnchor="middle" fontSize="10" fill="#8b9bad">
              {s}%
            </text>
          </g>
        ))}

        {visible.map((c, i) => {
          const power = c.power;
          const pts = [];
          const area = [];
          for (let s = 0; s <= 100; s += 1) {
            const px = x(s).toFixed(1);
            const py = y(taperedPowerAt(s, power)).toFixed(1);
            pts.push(`${px},${py}`);
            area.push(`${px},${py}`);
          }
          const color = COLORS[c.color] || c.color;
          return (
            <g key={c.label}>
              <polygon
                points={`${x(0).toFixed(1)},${y(0).toFixed(1)} ${area.join(" ")} ${x(100).toFixed(1)},${y(0).toFixed(1)}`}
                fill={color}
                opacity={i === 0 ? 0.08 : 0}
              />
              <polyline
                points={pts.join(" ")}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {hover != null && (
          <g pointerEvents="none" aria-hidden="true">
            <line
              x1={hoverX}
              x2={hoverX}
              y1={pad.t}
              y2={H - pad.b}
              stroke="#071d34"
              strokeWidth="1"
              strokeDasharray="4 3"
              opacity="0.5"
            />
            {visible.map((c) => {
              const color = COLORS[c.color] || c.color;
              const kw = taperedPowerAt(hover, c.power);
              return (
                <circle
                  key={c.label}
                  cx={hoverX}
                  cy={y(kw)}
                  r={c === visible[0] ? 4.5 : 3}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="2"
                  opacity={c === visible[0] || c.power !== Math.round(visible[0].power) ? 1 : 0.6}
                />
              );
            })}
          </g>
        )}
      </svg>

      {hover != null && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1 z-10 rounded-lg border border-navy/10 bg-white px-3 py-2 shadow-lift"
          style={{
            left: `${hoverLeftPct}%`,
            transform: flipTip ? "translateX(calc(-100% - 8px))" : "translateX(8px)",
          }}
        >
          <p className="text-xs font-bold text-navy">{Math.round(hover)}% battery</p>
          <div className="mt-1 space-y-0.5">
            {visible.map((c) => {
              const color = COLORS[c.color] || c.color;
              const kw = taperedPowerAt(hover, c.power);
              return (
                <p key={c.label} className="inline-flex items-center gap-1.5 text-xs font-medium text-navy/70">
                  <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                  {Math.round(kw)} kW
                </p>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5">
        {visible.map((c) => (
          <span key={c.label} className="inline-flex items-center gap-1.5 text-xs font-medium text-navy/70">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[c.color] || c.color }} />
            {c.capped ? `${c.label} — ${Math.round(c.power)} kW limit` : c.label}
          </span>
        ))}
        <span className="text-xs text-navy/45">hover the chart to probe speed</span>
      </div>
    </div>
  );
}