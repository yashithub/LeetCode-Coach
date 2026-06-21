export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="h-14 border-b border-border bg-surface-2/50 animate-pulse" />
      <div className="max-w-6xl mx-auto px-6 py-12 animate-pulse">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-full bg-surface-2" />
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-surface-2" />
            <div className="h-3 w-24 rounded bg-surface-2" />
          </div>
        </div>

        <div className="h-56 rounded-2xl bg-surface-2 mb-8" />

        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="h-72 rounded-2xl bg-surface-2" />
          <div className="h-72 rounded-2xl bg-surface-2" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-surface-2" />
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <div className="h-64 rounded-2xl bg-surface-2" />
          <div className="h-64 rounded-2xl bg-surface-2" />
        </div>

        <div className="h-96 rounded-2xl bg-surface-2" />
      </div>
    </div>
  );
}
