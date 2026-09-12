import Image from "next/image";

interface AuthHeaderProps {
  title: string;
  description?: string;
}

export function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <div className="mb-6 text-center">
      <div className="mb-4 inline-flex items-center justify-center">
        <div className="relative">
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Image
              alt="Threshold Lab"
              className="size-10 md:size-11"
              height={44}
              src="/wordmark-light.svg"
              width={44}
            />
          </div>
        </div>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description && (
        <p className="mt-1.5 text-sm tracking-wide text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
