/** Parse dollar input without rounding away extra decimals or accepting exponents. */
export function parsePriceInput(value: string): number | null {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value.trim());
  if (!match) return null;
  const cents =
    Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents >= 100 && cents <= 99_999_999
    ? cents
    : null;
}
