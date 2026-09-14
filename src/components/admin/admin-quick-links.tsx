import {
  IconCalendarStats,
  IconFlag3,
  IconNotebook,
  IconTable,
  IconUsersGroup,
} from "@tabler/icons-react";
import { AdminToolCard } from "@/components/admin/admin-tool-card";

const operationLinks = [
  {
    actionLabel: "View totals",
    description: "Review weekly training metrics and performance charts.",
    href: "/lab/admin/totals",
    icon: IconTable,
    title: "Weekly totals",
  },
  {
    actionLabel: "Manage notes",
    description: "Write, preview, publish, and hide Lab Notes.",
    href: "/lab/admin/posts",
    icon: IconNotebook,
    title: "Lab Notes",
  },
  {
    actionLabel: "Manage races",
    description: "Add HYROX, Elite 15, run races, and other events.",
    href: "/lab/admin/races",
    icon: IconFlag3,
    title: "Race calendar",
  },
  {
    actionLabel: "Manage blocks",
    description: "Set the dated training focus shown with Lab Notes.",
    href: "/lab/admin/blocks",
    icon: IconCalendarStats,
    title: "Training blocks",
  },
] as const;

export function AdminQuickLinks() {
  return (
    <section
      aria-labelledby="admin-tools-heading"
      className="flex flex-col gap-8"
    >
      <header className="space-y-1">
        <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          Admin tools
        </p>
        <h2
          className="text-xl font-semibold tracking-tight"
          id="admin-tools-heading"
        >
          Manage the lab
        </h2>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Keep member access, training content, and operations organized from
          one place.
        </p>
      </header>

      <div className="space-y-3">
        <h3 className="text-muted-foreground text-sm font-medium">
          People &amp; access
        </h3>
        <AdminToolCard
          actionLabel="Manage users"
          description="Review registered members, subscriptions, and admin privileges. Manage pre-signup role defaults from the same workspace."
          href="/lab/admin/users"
          icon={IconUsersGroup}
          title="Users & access"
          wide
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-muted-foreground text-sm font-medium">
          Content &amp; training
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {operationLinks.map((link) => (
            <AdminToolCard key={link.href} {...link} />
          ))}
        </div>
      </div>
    </section>
  );
}
