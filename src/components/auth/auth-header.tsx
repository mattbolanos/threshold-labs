import Image from "next/image";

interface AuthHeaderProps {
  title: string;
  description: string;
}

export function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <div className="mb-4 text-center">
      <div className="mb-2 inline-flex items-center justify-center">
        <div className="relative">
          <div className="bg-primary text-primary-foreground shadow-primary/25 flex size-16 items-center justify-center rounded-2xl shadow-lg">
            <Image
              alt="Threshold Lab"
              className="size-11 md:size-13"
              height={52}
              src="/wordmark-light.svg"
              width={52}
            />
          </div>
        </div>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-2">{description}</p>
    </div>
  );
}
