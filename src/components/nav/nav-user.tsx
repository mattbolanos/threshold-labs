import { ThemeToggle } from "@/components/theme/toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface NavUserProps {
  user?: {
    email: string;
    name: string;
  } | null;
}

export function NavUser({ user }: NavUserProps) {
  if (!user) {
    return null;
  }

  const email = user.email.trim();
  const username = user.name.trim() || email;
  const initials = getInitials(username, email);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            aria-label={`${username} menu`}
            className="max-md:hidden rounded-full outline-hidden transition-[opacity,transform] duration-150 ease-in-out hover:scale-105 hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            type="button"
          />
        }
      >
        <Avatar>
          <AvatarFallback className="text-xs font-semibold uppercase">
            {initials}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1 shadow-md">
        <div className="mb-2 flex flex-col gap-1 px-2 py-1.5">
          <span className="text-sm font-medium">{username}</span>
          <span className="text-muted-foreground text-xs">{email}</span>
        </div>

        <MenuItem className="focus:text-muted-foreground hover:text-muted-foreground cursor-default justify-between hover:bg-transparent focus:bg-transparent">
          Theme
          <ThemeToggle />
        </MenuItem>
      </PopoverContent>
    </Popover>
  );
}

function getInitials(name: string, email: string) {
  const parts = name.split(/\s+/).filter(Boolean);

  if (parts.length > 1) {
    return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
  }

  const fallback = parts[0] || email.split("@")[0] || "";
  return fallback.slice(0, 2).toUpperCase();
}

function MenuItem({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground text-muted-foreground relative flex h-9 cursor-default items-center gap-2 rounded-sm px-2.5 py-2 text-sm outline-hidden transition-colors duration-200 select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
