const GRID_TEMPLATE =
  "minmax(190px,1.6fr) minmax(140px,1.1fr) 140px 100px 78px 132px 84px 44px";

function Bar({ w }: { w: string }) {
  return <div className="skeleton h-3.5 rounded-md" style={{ width: w }} />;
}

/** Shimmer placeholder shown while the quotes list "loads". */
export default function QuotesSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="surface overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <div className="min-w-[920px]">
          <div
            className="grid items-center gap-x-3 border-b border-line bg-black/[0.015] px-4 py-3"
            style={{ gridTemplateColumns: GRID_TEMPLATE }}
          >
            {Array.from({ length: 7 }).map((_, i) => (
              <Bar key={i} w="60%" />
            ))}
            <div />
          </div>

          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="grid items-center gap-x-3 border-b border-line/70 px-4 py-4 last:border-0"
              style={{ gridTemplateColumns: GRID_TEMPLATE }}
            >
              <div className="flex items-center gap-3">
                <div className="skeleton h-8 w-8 rounded-full" />
                <div className="space-y-1.5">
                  <Bar w="120px" />
                  <Bar w="80px" />
                </div>
              </div>
              <Bar w="70%" />
              <div className="flex justify-end">
                <Bar w="80%" />
              </div>
              <div className="skeleton h-5 w-16 rounded-full" />
              <div className="flex justify-end">
                <Bar w="60%" />
              </div>
              <div className="skeleton h-6 w-20 rounded-full" />
              <div className="flex justify-end">
                <Bar w="70%" />
              </div>
              <div className="skeleton mx-auto h-6 w-6 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
