import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

export function AuthModeSwitch({
  mode,
  nextPath,
}: {
  mode: "login" | "signup";
  nextPath: string | null;
}) {
  const isSignup = mode === "signup";
  return (
    <CardFooter className="justify-center gap-1.5">
      <span className="text-muted-foreground">
        {isSignup ? "Already have an account?" : "New here?"}
      </span>
      <Button
        className="px-0!"
        nativeButton={false}
        render={
          <Link
            href={{
              pathname: isSignup ? "/login" : "/signup",
              query: nextPath ? { next: nextPath } : undefined,
            }}
          />
        }
        size="sm"
        variant="link"
      >
        {isSignup ? "Sign in" : "Create an account"}
      </Button>
    </CardFooter>
  );
}
