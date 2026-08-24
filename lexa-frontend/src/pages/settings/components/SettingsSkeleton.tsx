import { Skeleton } from "@/components/ui/skeleton";

// Items per nav group, matching SettingsLayout's SETTINGS_GROUPS.
const GROUPS = [4, 5, 3, 2];

export function SettingsSkeleton() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background md:flex-row">
      {/* Mobile header */}
      <div className="glass-strong sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/40 px-4 md:hidden">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-6 w-24 rounded" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      {/* Desktop sidebar */}
      <aside className="glass-card sticky top-0 hidden h-screen w-[280px] flex-col border-r border-border/40 p-4 md:flex lg:w-[320px]">
        <div className="flex items-center gap-4 p-2 pb-6">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-6 w-24 rounded" />
        </div>
        <div className="space-y-6">
          {GROUPS.map((count, groupIndex) => (
            <div key={groupIndex} className="space-y-2">
              <Skeleton className="h-3 w-20 rounded" />
              {Array.from({ length: count }).map((_, itemIndex) => (
                <Skeleton key={itemIndex} className="h-9 w-full rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="h-[calc(100vh-64px)] w-full flex-1 overflow-hidden p-4 md:h-screen md:p-8 lg:p-12">
        <div className="mx-auto max-w-3xl space-y-8">
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