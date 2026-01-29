# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Threshold Labs is a platform for HYROX coaches to share workout details with athletes. Built with Next.js 16 (App Router), React 19, and TypeScript.

## Commands

- `bun dev` - Start development server with Turbopack
- `bun build` - Production build with Turbopack
- `bun lint` - Run Biome linter (`biome check`)
- `bun format` - Format code with Biome (`biome format --write`)
- `bun typecheck` - TypeScript type checking
- `npx drizzle-kit generate` - Generate Drizzle migrations
- `npx drizzle-kit migrate` - Run Drizzle migrations
- `npx drizzle-kit push` - Push schema changes to database
- `npx convex dev` - Start Convex development server

## Architecture

### Dual Database Pattern

This project uses two databases with distinct purposes:

1. **Neon PostgreSQL** (via Drizzle ORM) - User authentication and access control
   - Schema in `src/lib/db/schema.ts` using custom `thlab` schema
   - Auth tables: `user`, `session`, `account`, `verification`
   - Business tables: `clients` (allowlist for signup)
   - Connection in `src/lib/db/index.ts`

2. **Convex** - Real-time workout data
   - Schema in `convex/schema.ts`
   - Queries in `convex/workouts.ts`
   - Used for workout tracking, training load, run volume metrics

### Authentication

Uses better-auth with Google OAuth and email/password. Signup is gated by the `clients` table - users must be pre-registered with an active email to sign up.

- Server config: `src/lib/auth/index.ts`
- Client hooks: `src/lib/auth/auth-client.ts`
- API route: `src/app/api/auth/[...all]/route.ts`

### Providers Stack

Client providers wrap the app (`src/app/providers.tsx`):
- `NuqsAdapter` - URL state management
- `ConvexProvider` - Real-time database
- `ThemeProvider` - Dark/light mode

### Key Conventions

- URL state via nuqs for filters, pagination, navigation
- Tailwind CSS v4 with tw-animate-css
- Radix UI primitives for accessible components
- Framer Motion for animations
- Recharts for data visualization

## UI Guidelines

See `AGENTS.md` for comprehensive interface guidelines including:
- Accessibility requirements (keyboard navigation, focus management, ARIA)
- Animation rules (prefers-reduced-motion, CSS transitions)
- Form patterns (validation, loading states, error handling)
- Performance considerations
