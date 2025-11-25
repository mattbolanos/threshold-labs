import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function NavUser() {
  return (
    <div>
      <Avatar>
        <AvatarImage alt="Stephen Pelkofer" src="/stephen-avatar.jpg" />
        <AvatarFallback>SP</AvatarFallback>
      </Avatar>
    </div>
  );
}
