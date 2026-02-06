import Image from "next/image";

interface AuthHeaderProps {
  title: string;
  description: string;
}

export function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <div className="mb-6 text-center">
      <div className="mb-4 inline-flex items-center justify-center">
        <div className="relative">
          <div className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-xl shadow-[0_0_24px_-4px] shadow-primary/30">
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
      <p className="text-muted-foreground mt-1.5 text-sm tracking-wide">
        {description}
      </p>
    </div>
  );
}
