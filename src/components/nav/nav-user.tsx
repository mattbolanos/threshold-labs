import { IconSettings } from "@tabler/icons-react";
import { ThemeToggle } from "@/components/theme/toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface NavUserProps {
  email: string;
  imageUrl: string;
  initials: string;
  username: string;
}

export function NavUser({ email, imageUrl, initials, username }: NavUserProps) {
  return (
    <Popover>
      <PopoverTrigger asChild className="max-md:hidden">
        <Avatar className="cursor-pointer transition-[opacity,transform] duration-150 ease-in-out hover:scale-105 hover:opacity-85">
          <AvatarImage alt="User avatar" src={imageUrl} />
          <AvatarFallback>{initials}</AvatarFallback>
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
        <Separator className="my-1" />
        <MenuItem>
          <IconSettings />
          Account Settings
        </MenuItem>
      </PopoverContent>
    </Popover>
  );
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
