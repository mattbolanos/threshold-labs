import { expect, test } from "bun:test";
import { formatBundlePrice } from "./billing";
import { parsePriceInput } from "./price-input";

test.each([
  ["500", 50_000],
  [" 400 ", 40_000],
  ["499.99", 49_999],
  ["5.1", 510],
  ["1", 100],
  ["999999.99", 99_999_999],
] as const)("parses USD %s without losing cents", (input, expected) => {
  expect(parsePriceInput(input)).toBe(expected);
});
test.each([
  "",
  " ",
  "0",
  "-500",
  "1.001",
  "5e2",
  "Infinity",
  "$500",
  "1,000",
  ".50",
  "1000000",
  "9007199254740992",
])("rejects invalid price input %s", (input) => {
  expect(parsePriceInput(input)).toBeNull();
});
test("bundle labels reflect the saved dollar amount and cents", () => {
  expect(formatBundlePrice(50_000)).toBe("$500");
  expect(formatBundlePrice(49_950)).toBe("$499.50");
  expect(formatBundlePrice(100_000)).toBe("$1,000");
});
