import {
  IconBlockquote,
  IconCode,
  IconList,
  IconListNumbers,
  IconPilcrow,
} from "@tabler/icons-react";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

type PostMarkdownToolbarProps = {
  onChange: (value: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
};

type MarkdownBlock = {
  icon?: typeof IconPilcrow;
  label: string;
  template: (selection: string) => string;
};

const BLOCK_GROUPS: MarkdownBlock[][] = [
  [
    {
      label: "H1",
      template: (selection) => `# ${selection || "Heading"}`,
    },
    {
      label: "H2",
      template: (selection) => `## ${selection || "Heading"}`,
    },
    {
      icon: IconPilcrow,
      label: "Paragraph",
      template: (selection) => selection || "Write a paragraph.",
    },
  ],
  [
    {
      icon: IconList,
      label: "Bullets",
      template: (selection) =>
        selection
          ? selection
              .split("\n")
              .map((line) => `- ${line}`)
              .join("\n")
          : "- First point\n- Second point",
    },
    {
      icon: IconListNumbers,
      label: "Numbered",
      template: (selection) =>
        selection
          ? selection
              .split("\n")
              .map((line, index) => `${index + 1}. ${line}`)
              .join("\n")
          : "1. First step\n2. Second step",
    },
  ],
  [
    {
      icon: IconBlockquote,
      label: "Quote",
      template: (selection) => `> ${selection || "Quoted text"}`,
    },
    {
      icon: IconCode,
      label: "Code",
      template: (selection) => `\`\`\`\n${selection || "code"}\n\`\`\``,
    },
  ],
];

export function PostMarkdownToolbar({
  onChange,
  textareaRef,
  value,
}: PostMarkdownToolbarProps) {
  const insertBlock = (block: MarkdownBlock) => {
    const textarea = textareaRef.current;
    const selectionStart = textarea?.selectionStart ?? value.length;
    const selectionEnd = textarea?.selectionEnd ?? value.length;
    const selectedText = value.slice(selectionStart, selectionEnd);
    const blockText = block.template(selectedText);
    const prefix =
      selectionStart > 0 && !value.slice(0, selectionStart).endsWith("\n\n")
        ? "\n\n"
        : "";
    const suffix =
      selectionEnd < value.length &&
      !value.slice(selectionEnd).startsWith("\n\n")
        ? "\n\n"
        : "";
    const insertedText = `${prefix}${blockText}${suffix}`;
    const nextValue = `${value.slice(0, selectionStart)}${insertedText}${value.slice(selectionEnd)}`;

    onChange(nextValue);

    requestAnimationFrame(() => {
      const nextTextarea = textareaRef.current;
      const nextSelectionStart = selectionStart + prefix.length;
      nextTextarea?.focus();
      nextTextarea?.setSelectionRange(
        nextSelectionStart,
        nextSelectionStart + blockText.length,
      );
    });
  };

  return (
    <div
      aria-label="Insert Markdown block"
      className="flex flex-wrap gap-2"
      role="toolbar"
    >
      {BLOCK_GROUPS.map((group) => (
        <ButtonGroup key={group.map((block) => block.label).join("-")}>
          {group.map((block) => {
            const Icon = block.icon;
            return (
              <Button
                key={block.label}
                onClick={() => insertBlock(block)}
                size="sm"
                type="button"
                variant="outline"
              >
                {Icon ? <Icon data-icon="inline-start" /> : null}
                {block.label}
              </Button>
            );
          })}
        </ButtonGroup>
      ))}
    </div>
  );
}
