"use client";

import { useRef, useState } from "react";

export type LinePoint = { label: string; value: number };

const W = 640;
const H = 180;
const PAD_TOP = 16;
const PAD_BOTTOM = 8;
const PAD_LEFT = 4;
const PAD_RIGHT = 54;

/** Single-series line chart: 2px line, 10% area wash, hairline recessive grid,
 *  crosshair + tooltip on hover. No legend — one series, so the card title
 *  already says what's plotted. */
export default function LineChart({
  data,
  color = "var(--color-brand-500)",
  formatValue = (v: number) => String(Math.round(v)),
  height = 160,
}: {
  data: LinePoint[];
  color?: string;
  formatValue?: (value: number) => string;
  /** Rendered pixel height of the chart (the internal viewBox just stretches
   *  to fill it, since it's drawn with preserveAspectRatio="none"). */
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotW = W - PAD_LEFT - PAD_RIGHT;
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  const maxValue = Math.max(1, ...data.map((d) => d.value));

  const xAt = (i: number) =>
    data.length <= 1
      ? PAD_LEFT + plotW / 2
      : PAD_LEFT + (i / (data.length - 1)) * plotW;
  const yAt = (v: number) => PAD_TOP + plotH - (Math.max(0, v) / maxValue) * plotH;

  const points = data.map((d, i) => ({ x: xAt(i), y: yAt(d.value), ...d }));
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const last = points[points.length - 1];
  const areaPath = last
    ? `${linePath} L ${last.x} ${PAD_TOP + plotH} L ${PAD_LEFT} ${PAD_TOP + plotH} Z`
    : "";

  const gridSteps = [0, 0.5, 1];

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || points.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let best = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(p.x - px);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  };

  const hovered = hoverIndex != null ? points[hoverIndex] : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ height }}
        className="w-full touch-none"
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIndex(null)}
      >
        {gridSteps.map((s) => {
          const y = PAD_TOP + plotH - s * plotH;
          return (
            <g key={s}>
              <line
                x1={PAD_LEFT}
                x2={W - PAD_RIGHT + 8}
                y1={y}
                y2={y}
                stroke="var(--color-line)"
                strokeWidth={1}
              />
              <text
                x={W - PAD_RIGHT + 12}
                y={y}
                dy="0.32em"
                fill="var(--color-muted)"
                fontSize={11}
              >
                {formatValue(maxValue * s)}
              </text>
            </g>
          );
        })}

        {last && (
          <>
            <path d={areaPath} fill={color} opacity={0.1} stroke="none" />
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle cx={last.x} cy={last.y} r={6} fill="white" />
            <circle cx={last.x} cy={last.y} r={4} fill={color} />
          </>
        )}

        {hovered && (
          <>
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={PAD_TOP}
              y2={PAD_TOP + plotH}
              stroke="var(--color-line)"
              strokeWidth={1}
            />
            <circle cx={hovered.x} cy={hovered.y} r={6} fill="white" />
            <circle cx={hovered.x} cy={hovered.y} r={4} fill={color} />
          </>
        )}
      </svg>

      <div className="mt-1 flex justify-between text-xs text-muted">
        <span>{data[0]?.label ?? ""}</span>
        <span>{data[data.length - 1]?.label ?? ""}</span>
      </div>

      {hovered && (
        <div
          className="surface pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs"
          style={{
            left: `${(hovered.x / W) * 100}%`,
            top: `${(hovered.y / H) * 100}%`,
            marginTop: -10,
          }}
        >
          <div className="font-semibold text-ink">
            {formatValue(hovered.value)}
          </div>
          <div className="text-muted">{hovered.label}</div>
        </div>
      )}
    </div>
  );
}
