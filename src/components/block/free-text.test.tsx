import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { FreeText } from "./free-text";

test("renders single newlines as visible line breaks", () => {
  const markup = renderToStaticMarkup(
    <FreeText text={"Warm up\nMain set\nCool down"} title="Plan" />,
  );

  expect(markup).toContain("Warm up<br/>\nMain set<br/>\nCool down");
});

test("keeps Markdown list formatting", () => {
  const markup = renderToStaticMarkup(
    <FreeText text={"- First interval\n- Second interval"} title="Plan" />,
  );

  expect(markup).toContain("<ul>");
  expect(markup).toContain("<li>First interval</li>");
  expect(markup).toContain("<li>Second interval</li>");
});
