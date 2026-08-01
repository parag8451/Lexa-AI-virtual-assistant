import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      {/* Mobile Header Skeleton */}
      <div className="md:hidden sticky top-0 z-40 glass-strong border-b border-border/40 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-6 w-24 rounded" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      {/* Desktop Sidebar Skeleton */}
      <aside className="hidden md:flex flex-col w-[280px] lg:w-[320px] border-r border-border/40 h-screen sticky top-0 glass-card p-4">
        <div className="p-2 pb-6 flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-6 w-24 rounded" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 14 }).map((_, i) => (
            <Skeleton key={i} className={`h-10 rounded-lg w-full ${i === 13 ? 'mt-4' : ''}`} />
          ))}
        </div>
      </aside>

      {/* Main Content Area Skeleton */}
      <main className="flex-1 w-full h-[calc(100vh-64px)] md:h-screen p-4 md:p-8 lg:p-12 overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>

          <div className="space-y-6">
            <section className="space-y-4">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </section>
            
            <section className="space-y-4">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
