/**
 * Mock satellite view for the quote detail. Uses a fixed local image (we can't
 * call Google Maps from the mock). When wired for real, swap the <img src> for
 * a Google Static Maps / Solar imagery URL keyed to the lead's coordinates.
 */
export default function SatelliteView({ address }: { address: string }) {
  return (
    <div className="relative h-full min-h-[220px] overflow-hidden rounded-xl border border-white/60 bg-[#1a1e16] shadow-[var(--shadow-soft)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/satellite-roof.webp"
        alt={`Satellite view of ${address}`}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Vignette + roof outline overlay */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 40%, transparent 55%, rgba(0,0,0,0.35))",
          }}
        />
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <polygon className="sat-outline" points="34,40 62,32 70,54 42,63" />
        </svg>
      </div>
    </div>
  );
}
