import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type ParsePreviewSeedArgsOptions = {
  argv: string[];
  command: string;
  defaultOutput: string;
  description: string;
};

export type PreviewSeedOptions = {
  output: string;
  referenceDate: string;
};

export const todayIsoDate = () => new Date().toISOString().slice(0, 10);

export const parseIsoDate = (value: string) => {
  if (!ISO_DATE_PATTERN.test(value)) {
    throw new Error(`Invalid date: ${value}`);
  }

  const date = new Date(`${value}T12:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`Invalid date: ${value}`);
  }

  return date;
};

export const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * MS_PER_DAY);

export const getIsoWeekMonday = (date: Date) => {
  const day = date.getUTCDay();
  return addDays(date, -(day === 0 ? 6 : day - 1));
};

export const getNextWeekday = (date: Date, weekday: number) =>
  addDays(date, (weekday - date.getUTCDay() + 7) % 7);

export const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

export const parsePreviewSeedArgs = ({
  argv,
  command,
  defaultOutput,
  description,
}: ParsePreviewSeedArgsOptions): PreviewSeedOptions | null => {
  const options: PreviewSeedOptions = {
    output: defaultOutput,
    referenceDate: process.env.CONVEX_PREVIEW_REFERENCE_DATE ?? todayIsoDate(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        `${description}\n\nUsage:\n  ${command} [options]\n\nOptions:\n  --output <path>          Output JSONL path. Default: ${defaultOutput}\n  --reference-date <date> Date used as today in yyyy-MM-dd format. Default: today\n  --help                   Show this help text\n`,
      );
      return null;
    }

    const nextValue = argv[index + 1];

    if (!nextValue || nextValue.startsWith("--")) {
      throw new Error(`${arg} requires a value.`);
    }

    if (arg === "--output") {
      options.output = nextValue;
    } else if (arg === "--reference-date") {
      options.referenceDate = nextValue;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }

    index += 1;
  }

  parseIsoDate(options.referenceDate);
  return options;
};

export const writePreviewJsonl = <T>(output: string, documents: T[]) => {
  const outputPath = resolve(process.cwd(), output);
  const jsonl = `${documents.map((document) => JSON.stringify(document)).join("\n")}\n`;

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, jsonl, "utf8");

  return outputPath;
};
