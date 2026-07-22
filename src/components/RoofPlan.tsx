import type { LatLng, LeadPayload } from "@/lib/types";

/**
 * Plan view of the roof face the customer drew in the widget.
 *
 * Only ONE face survives to the database (the widget keeps the largest and
 * discards the others), and gutter/obstruction positions are never stored —
 * so this draws the outline and nothing else. Gutter length and obstruction
 * counts are shown as figures by the caller, not as markers on the shape.
 */

const VIEW = 100; // square viewBox; the polygon is fitted inside with padding
const PAD = 10;
const METRES_PER_DEG_LAT = 111_320;

type Projected = { points: string; widthM: number | null };

/** Equirectangular projection, good enough at building scale. Longitude is
 *  scaled by cos(lat) so the shape keeps its real proportions, then the whole
 *  outline is fitted into the viewBox. North stays up. */
function project(coords: LatLng[]): Projected | null {
  const pts = coords.filter(
    (c) => Number.isFinite(c?.lat) && Number.isFinite(c?.lng),
  );
  if (pts.length < 3) return null;

  const lat0 = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const kx = Math.cos((lat0 * Math.PI) / 180);

  const xs = pts.map((p) => p.lng * kx);
  const ys = pts.map((p) => -p.lat); // negate so increasing latitude draws upward

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const spanX = maxX - minX;
  const spanY = maxY - minY;
  const span = Math.max(spanX, spanY);
  if (!(span > 0)) return null;

  // Uniform scale for both axes — never stretch the roof to fill the box.
  const scale = (VIEW - PAD * 2) / span;
  const offsetX = PAD + (VIEW - PAD * 2 - spanX * scale) / 2;
  const offsetY = PAD + (VIEW - PAD * 2 - spanY * scale) / 2;

  const points = pts
    .map((p, i) => {
      const x = (xs[i] - minX) * scale + offsetX;
      const y = (ys[i] - minY) * scale + offsetY;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const widthM = spanX * METRES_PER_DEG_LAT;
  return { points, widthM: widthM > 0 ? widthM : null };
}

function Empty({ note }: { note: string }) {
  return (
    <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-black/[0.015] px-4 text-center">
      <svg
        width={26}
        height={26}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted"
        aria-hidden
      >
        <path d="M3 11l9-7 9 7M5 10v10h14V10" />
      </svg>
      <p className="mt-2 text-sm font-medium text-ink-soft">
        No roof outline captured
      </p>
      <p className="mt-0.5 text-xs text-muted">{note}</p>
    </div>
  );
}

export default function RoofPlan({ payload }: { payload: LeadPayload | null }) {
  if (!payload) {
    return <Empty note="Lead detail hasn't loaded." />;
  }

  const coords = payload.polygonCoords;
  if (!coords || coords.length < 3) {
    return <Empty note="This lead was submitted without a drawn roof." />;
  }

  const projected = project(coords);
  if (!projected) {
    return <Empty note="The stored outline could not be read." />;
  }

  const area = payload.solar?.areaM2;
  const pitch = payload.solar?.pitchDegrees;
  const roofType = payload.solar?.roofType;

  const facts = [
    area != null ? `${Math.round(area)} m²` : null,
    pitch != null ? `${Math.round(pitch)}°` : null,
    roofType ?? null,
  ].filter(Boolean) as string[];

  return (
    <figure className="relative h-full min-h-[220px] overflow-hidden rounded-xl border border-line bg-[#0f1520]">
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={`Plan view of the drawn roof outline${
          facts.length ? `, ${facts.join(", ")}` : ""
        }`}
      >
        <defs>
          <pattern
            id="roofplan-grid"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M10 0H0V10"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width={VIEW} height={VIEW} fill="url(#roofplan-grid)" />
        <polygon
          points={projected.points}
          fill="rgba(94,160,255,0.22)"
          stroke="#7cb0ff"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>

      {facts.length > 0 && (
        <figcaption className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {facts.map((f) => (
            <span
              key={f}
              className="rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold capitalize text-white backdrop-blur-sm"
            >
              {f}
            </span>
          ))}
        </figcaption>
      )}

      {projected.widthM != null && projected.widthM > 0 && (
        <span className="absolute bottom-3 right-3 text-[11px] font-medium text-white/60">
          ≈ {projected.widthM.toFixed(1)} m across
        </span>
      )}
    </figure>
  );
}
