interface DialogFreeTextProps {
  text: string | null;
  title: string;
}

export function DialogFreeText({ text, title }: DialogFreeTextProps) {
  if (!text) return null;

  return (
    <div className="space-y-1">
      <h3 className="font-semibold sm:text-lg">{title}</h3>
      <div className="leading-snug">{text}</div>
    </div>
  );
}
