export function MarketingHeaderFallback() {
  return (
    <header
      aria-hidden
      className="sticky top-0 z-50 w-full border-b border-primary/15 bg-neutral-950/90 backdrop-blur-xl"
    >
      <div className="route-padding-x mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-neutral-950">
            TL
          </span>
          <span className="text-sm font-bold text-white">THRESHOLD LAB</span>
        </div>

        <div className="mx-auto hidden h-4 w-72 rounded-md bg-neutral-800 xl:block" />

        <div className="hidden items-center gap-3 xl:flex">
          <div className="h-9 w-28 rounded-md border border-primary/30 bg-neutral-900" />
          <div className="h-9 w-32 rounded-md bg-primary" />
        </div>

        <div className="size-10 rounded-full border border-primary/25 xl:hidden" />
      </div>
    </header>
  );
}
