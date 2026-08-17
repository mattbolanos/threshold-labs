import Link from "next/link";

const socialLinks = [
  { href: "https://www.instagram.com/stephen.pelkofer/", label: "Instagram" },
  { href: "https://www.tiktok.com/@spelkofer", label: "TikTok" },
  { href: "https://www.pinterest.com/thresholdlab/", label: "Pinterest" },
] as const;

export function MarketingFooter() {
  return (
    <footer className="route-padding-x mx-auto flex max-w-7xl flex-col gap-8 py-12 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <Link className="flex items-center gap-2.5" href="/">
          <span className="flex size-9 items-center justify-center rounded-xl bg-lime-300 text-sm font-black text-neutral-950">
            TL
          </span>
          <span className="font-bold text-white">Threshold Lab</span>
        </Link>
        <p className="mt-4 text-sm text-neutral-500">
          HYROX and running coaching for athletes who train with intent.
        </p>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {socialLinks.map((link) => (
          <a
            className="text-sm font-semibold text-neutral-400 transition-colors hover:text-lime-300"
            href={link.href}
            key={link.label}
            rel="noreferrer"
            target="_blank"
          >
            {link.label}
          </a>
        ))}
        <Link
          className="text-sm font-semibold text-neutral-400 transition-colors hover:text-lime-300"
          href="/partnerships"
        >
          Partnerships
        </Link>
        <Link
          className="text-sm font-semibold text-neutral-400 transition-colors hover:text-lime-300"
          href="/login"
        >
          Sign in
        </Link>
      </div>
    </footer>
  );
}
