import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

type PostDoc = {
  category: string;
  content: string;
  createdAt: number;
  excerpt: string;
  isVisible: boolean;
  publishedAt: number;
  slug: string;
  title: string;
  updatedAt: number;
};

type PostTemplate = Omit<
  PostDoc,
  "createdAt" | "isVisible" | "publishedAt" | "updatedAt"
> & {
  daysAgo: number;
};

type CliOptions = {
  endDate: string;
  output: string;
};

const DEFAULT_OUTPUT = ".generated/convex-preview-posts.jsonl";
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const POST_TEMPLATES: PostTemplate[] = [
  {
    category: "Training Notes",
    content: `## The useful signal is repeatability

One excellent session tells us less than three steady weeks. In this block, the goal is to make the important work repeatable before adding more volume.

We are watching three simple signals:

- Quality sessions finish with one good rep still available.
- Easy days remain genuinely easy.
- Sleep and appetite return to baseline within 24 hours.

When those stay stable, progression is straightforward. When they drift, the right move is usually to hold the load—not force another breakthrough.`,
    daysAgo: 0,
    excerpt:
      "Consistency is easier to coach when we judge the block by repeatable weeks, not one standout session.",
    slug: "repeatability-is-the-signal",
    title: "Repeatability Is the Signal",
  },
  {
    category: "Running",
    content: `## Keep the first rep quiet

Threshold sessions work best when the opening rep feels almost too controlled. That restraint creates room to keep mechanics clean as fatigue builds.

For the next progression:

1. Start at the low end of the target pace.
2. Hold the same cadence across every rep.
3. Only increase pace if breathing settles during recovery.

The win is a narrow spread between the first and last rep, not the fastest split of the day.`,
    daysAgo: 3,
    excerpt:
      "A better threshold session starts conservatively and keeps the gap between the first and last rep small.",
    slug: "keep-the-first-rep-quiet",
    title: "Keep the First Rep Quiet",
  },
  {
    category: "HYROX",
    content: `## Transitions are part of the effort

Compromised running is not only about holding pace after a station. The transition itself changes breathing, posture, and decision-making.

This week we are practicing a simple sequence: finish the station under control, take two deliberate breaths, then build into the run over the first 100 meters. No sprint out of the gate.

That small reset keeps the early enthusiasm from becoming late-race debt.`,
    daysAgo: 7,
    excerpt:
      "Treat the first 100 meters after a station as a controlled build, not a chance to win back time immediately.",
    slug: "practice-the-transition",
    title: "Practice the Transition",
  },
  {
    category: "Recovery",
    content: `## Easy days should create capacity

Recovery work has a job: help the next key session happen. If an easy day adds soreness or requires its own recovery, it missed the assignment.

Keep the effort conversational, choose movements that feel smooth, and finish with more energy than you started. Duration is secondary to the response we want tomorrow.

The test is simple: the following warm-up should feel better, not heavier.`,
    daysAgo: 12,
    excerpt:
      "An easy session succeeds when it leaves the next warm-up feeling smoother and the athlete ready for quality work.",
    slug: "recovery-has-a-job",
    title: "Recovery Has a Job",
  },
  {
    category: "Strength",
    content: `## Strength that survives fatigue

The most useful strength work supports posture and force production when breathing is high. That does not mean every lift needs to become conditioning.

We keep the main lifts deliberate, rest long enough for clean reps, and use carries or sled work to connect that strength to the demands of racing.

Quality first. Density later. The transfer comes from owning the position before testing it under pressure.`,
    daysAgo: 18,
    excerpt:
      "Build clean positions with deliberate strength work before asking those positions to hold up under race fatigue.",
    slug: "strength-that-survives-fatigue",
    title: "Strength That Survives Fatigue",
  },
  {
    category: "Programming",
    content: `## Progress the smallest useful variable

Training gets noisy when pace, volume, density, and exercise selection all change at once. A cleaner progression changes one variable and watches the response.

Add a rep, extend the work interval, or shorten recovery—but rarely all three in the same week. This makes the result easier to interpret and the next decision easier to defend.

Simple progressions are not timid. They are legible.`,
    daysAgo: 27,
    excerpt:
      "Change one training variable at a time so the athlete's response stays clear and the next decision stays defensible.",
    slug: "progress-one-variable",
    title: "Progress One Variable",
  },
];

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

const printHelp = () => {
  process.stdout.write(`Generate Convex JSONL seed data for preview posts.

Usage:
  bun scripts/generate_preview_posts_import.ts [options]

Options:
  --output <path>    Output JSONL path. Default: ${DEFAULT_OUTPUT}
  --end-date <date>  Most recent post date in yyyy-MM-dd format. Default: today
  --help             Show this help text
`);
};

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {
    endDate: todayIsoDate(),
    output: DEFAULT_OUTPUT,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    const nextValue = argv[index + 1];

    if (!nextValue || nextValue.startsWith("--")) {
      throw new Error(`${arg} requires a value.`);
    }

    if (arg === "--output") {
      options.output = nextValue;
    } else if (arg === "--end-date") {
      options.endDate = nextValue;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }

    index += 1;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.endDate)) {
    throw new Error("--end-date must use yyyy-MM-dd format.");
  }

  return options;
};

const parseIsoDate = (value: string) => {
  const date = new Date(`${value}T12:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }

  return date;
};

const generatePosts = (endDate: string): PostDoc[] => {
  const latestPublishedAt = parseIsoDate(endDate).getTime();

  return POST_TEMPLATES.map(({ daysAgo, ...post }) => {
    const publishedAt = latestPublishedAt - daysAgo * MS_PER_DAY;

    return {
      ...post,
      createdAt: publishedAt - 2 * MS_PER_DAY,
      isVisible: true,
      publishedAt,
      updatedAt: publishedAt,
    };
  });
};

const main = () => {
  const options = parseArgs(process.argv.slice(2));
  const posts = generatePosts(options.endDate);
  const outputPath = resolve(process.cwd(), options.output);
  const jsonl = `${posts.map((post) => JSON.stringify(post)).join("\n")}\n`;

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, jsonl, "utf8");

  process.stdout.write(`Generated ${posts.length} posts at ${outputPath}\n`);
};

main();
