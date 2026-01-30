import { IconMailX } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NoInvite({ email }: { email: string }) {
  return (
    <div className="bg-card/80 rounded-2xl border p-8 shadow-xl shadow-black/5 backdrop-blur-sm">
      <div className="flex flex-col items-center text-center">
        <div className="bg-destructive/10 mb-4 flex size-14 items-center justify-center rounded-full">
          <IconMailX className="text-destructive size-7" />
        </div>
        <h1 className="text-lg font-semibold">No Invitation Found</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {email ? (
            <>
              The email{" "}
              <span className="text-foreground font-medium">{email}</span> is
              not on the invite list.
            </>
          ) : (
            "Your email is not on the invite list."
          )}
        </p>
        <div className="bg-muted/50 mt-5 w-full rounded-lg p-4 text-left text-sm">
          <p className="font-medium">What to do next:</p>
          <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1">
            <li>Contact your coach to request an invitation</li>
            <li>Make sure you&apos;re using the email your coach has</li>
            <li>Check for typos in your email address</li>
          </ul>
        </div>
        <Button asChild className="mt-6 w-full" size="lg" variant="outline">
          <Link href="/signup">Try a Different Email</Link>
        </Button>
        <p className="text-muted-foreground mt-4 text-sm">
          Already have an account?{" "}
          <Link
            className="text-foreground font-medium underline-offset-4 transition-colors hover:underline"
            href="/login"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
