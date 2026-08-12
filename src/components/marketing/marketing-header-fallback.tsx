export function MarketingHeaderFallback() {
  return (
    <header
      aria-hidden
      className="sticky top-3 z-50 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <div className="flex h-16 items-center justify-between rounded-full border border-lime-300/20 bg-neutral-950/90 px-3 shadow-2xl backdrop-blur-xl sm:px-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-lime-300 text-sm font-black text-neutral-950">
            TL
          </span>
          <span className="text-sm font-bold tracking-tight text-white sm:text-base">
            Threshold Lab
          </span>
        </div>

        <div className="hidden h-4 w-72 rounded-full bg-neutral-800 xl:block" />

        <div className="hidden items-center gap-2 sm:flex">
          <div className="h-10 w-28 rounded-full border border-lime-300/30 bg-neutral-900" />
          <div className="h-10 w-32 rounded-full bg-lime-300" />
        </div>

        <div className="size-10 rounded-full border border-lime-300/25 xl:hidden" />
      </div>
    </header>
  );
}
