// A plausible fixed "hill" shape — same silhouette LineChart tends to render
// for a short trailing window (rises, peaks, tails off) — not real data.
const LINE_PATH = "M0,62 L18,58 L36,22 L54,34 L72,14 L86,30 L100,58";
const AREA_PATH = `${LINE_PATH} L100,80 L0,80 Z`;

/** Graph-shaped placeholder for a LineChart still loading, so the skeleton
 *  reads as "a chart is coming" instead of an inert gray box. */
export default function ChartSkeleton({ height = 90 }: { height?: number }) {
  return (
    <div>
      <div
        className="skeleton relative overflow-hidden rounded-xl"
        style={{ height }}
      >
        <svg
          viewBox="0 0 100 80"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path d={AREA_PATH} fill="rgba(10,11,13,0.05)" />
          <path
            d={LINE_PATH}
            fill="none"
            stroke="rgba(10,11,13,0.14)"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="mt-1 flex justify-between">
        <div className="skeleton h-2.5 w-10 rounded" />
        <div className="skeleton h-2.5 w-10 rounded" />
      </div>
    </div>
  );
}
