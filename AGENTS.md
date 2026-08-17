instead of npm commands, run them with bun. avoid writing tailwind classes with brackets (e.g. `rounded-[6px]`), prefer `rounded-sm` or `rounded-md`, for example. try to keep files less than 500 lines of code. favor block-based architecture by making reusable component files rather than master files.

### UI choices and design language

stay within the current design language. don't go outside of the lines and try to create a drastically different aesthetic then we already have.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
