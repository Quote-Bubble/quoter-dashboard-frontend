import PageHeader from "@/components/PageHeader";
import ChartSkeleton from "@/components/charts/ChartSkeleton";

function Bar({ w }: { w: string }) {
  return <div className="skeleton h-3 rounded-md" style={{ width: w }} />;
}

function InfoCardSkeleton() {
  return (
    <div className="surface rounded-2xl p-4">
      <Bar w="120px" />
      <div className="mt-1.5">
        <div className="skeleton h-5 w-16 rounded-md" />
      </div>
      <div className="mt-1">
        <Bar w="80px" />
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="surface rounded-2xl p-4">
      <Bar w="100px" />
      <div className="mt-1.5">
        <div className="skeleton h-5 w-20 rounded-md" />
      </div>
      <div className="mt-1">
        <Bar w="120px" />
      </div>
      <div className="mt-3">
        <ChartSkeleton height={90} />
      </div>
    </div>
  );
}

function BarListSkeleton() {
  return (
    <div className="surface rounded-2xl p-4">
      <Bar w="110px" />
      <div className="mt-1">
        <Bar w="140px" />
      </div>
      <div className="mt-3 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className="flex items-center justify-between">
              <Bar w="90px" />
              <Bar w="50px" />
            </div>
            <div className="skeleton mt-1 h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Shaped to match AnalyticsClient's Today row + overview grid. */
export default function AnalyticsLoading() {
  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Quote volume and estimated value across your pipeline."
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <InfoCardSkeleton />
        <InfoCardSkeleton />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="skeleton h-5 w-32 rounded-md" />
        <div className="skeleton h-7 w-32 rounded-lg" />
      </div>

      <div className="mb-3 flex gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-6 w-16 rounded-full" />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <BarListSkeleton />
        <BarListSkeleton />
      </div>
    </>
  );
}
