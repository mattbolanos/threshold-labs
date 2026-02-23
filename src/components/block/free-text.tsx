interface FreeTextProps {
  text: string | null;
  title: string;
}

export function FreeText({ text, title }: FreeTextProps) {
  if (!text) return null;

  return (
    <div className="space-y-1">
      <h3 className="font-semibold sm:text-lg">{title}</h3>
      <div className="whitespace-pre-line leading-snug">{text}</div>
    </div>
  );
}
