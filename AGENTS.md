AGENTS.md — Interface Guidelines for Generated UIs

Source of truth: Vercel Web Interface Guidelines — see "Audit Checklist" and patterns below adapted for agent use. Reference: https://vercel.com/design/guidelines

Purpose

- Ensure all generated interfaces are accessible, fast, resilient, and align with modern Next.js/React practices.
- Provide concrete defaults, code patterns, and an audit checklist agents must apply before producing UI.

Scope

- Client UIs (React/Next.js) including forms, dialogs, navigation, lists/tables, content pages, and interactive controls.
- Copywriting and accessibility surface-level rules.

Non‑Negotiable Principles

- Keyboard works everywhere. Every interactive flow is keyboard‑operable following WAI‑ARIA Authoring Patterns.
- Clear visible focus rings using :focus-visible; apply :focus-within for grouped controls.
- Links are links. Use <a> / next/link for navigation; do not use <button> for navigation.
- Respect zoom and reduced motion. Never disable browser zoom; honor prefers-reduced-motion.
- URL as state. Deep‑link stateful UI (filters, tabs, pagination, expanded panels, etc.).
- Hydration-safe inputs. Inputs must not lose focus/value after hydration.
- Minimum hit targets. ≥24 px touch targets; mobile minimum 44 px.

Interaction Rules

- Manage focus: trap in modals/drawers; move/return focus per WAI‑ARIA patterns.
- Loading buttons: show an inline spinner and keep the original label; disable only during the in‑flight request.
- Minimum loading-state duration: add a short show‑delay (~150–300 ms) and minimum visible time (~300–500 ms) to avoid flicker; React Suspense handles this by default if used.
- Optimistic updates: update UI immediately when success is likely; reconcile on server response; on failure, show error and undo/rollback.
- Ellipsis: use … in actions that lead to further input or in-progress states (e.g., Rename…, Loading…).
- Destructive actions: require confirmation or provide Undo with a safe window.
- Prevent double‑tap zoom on controls: touch-action: manipulation on interactive elements.
- Tooltip timing: delay first tooltip in a group; subsequent peers have no delay.
- Overscroll behavior: set overscroll-behavior: contain on modals/drawers to prevent scroll chaining.
- Scroll position persists: Back/Forward must restore prior scroll; avoid programmatic scroll resets.
- Autofocus: desktop single-primary-input contexts only; avoid on mobile (keyboard can shift layout).
- No dead zones: if it looks interactive, it is. Expand hit areas around small visuals.
- Announce async updates: use polite aria-live for toasts and inline validation.
- Locale-aware shortcuts: prefer platform‑aware, layout‑aware bindings; surface help.

Animation Rules

- Honor prefers-reduced-motion: provide reduced or no-motion variants.
- Prefer CSS transitions/animations; avoid main‑thread JS where possible. Prioritize transform/opacity; avoid layout‑affecting properties.
- Choose easing based on subject (size/distance/trigger). Animations must be interruptible by user input.
- Never transition: all. Explicitly list properties, typically opacity, transform.
- SVG transforms: animate <g> wrappers; set transform-box: fill-box; transform-origin: center for cross‑browser correctness.

Layout Rules

- Optical alignment: allow ±1 px optical nudge where perception beats geometry.
- Deliberate alignment to grid/baseline/edges; avoid accidental positioning.
- Responsive coverage: validate mobile, laptop, ultra‑wide (simulate 50% zoom for ultra‑wide).
- Respect safe areas: account for device notches/insets via env(safe-area-inset-\*).
- Avoid unwanted scrollbars: fix overflow; test with scrollbars always visible (macOS setting) to simulate Windows.
- Let CSS size/layout: prefer flex/grid/intrinsic techniques; avoid JS measuring/forcing layout thrash.

Content Rules

- Inline help over tooltips; design all states (empty, sparse, dense, error).
- Accurate titles: <title> reflects current context; headings are hierarchical (h1–h6) with anchored headings (scroll-margin-top).
- Typography: curly quotes (“ ”), tabular nums for comparisons; avoid widows/orphans where practical.
- Redundant status cues: never rely on color alone; include text labels.
- Icon-only buttons: include descriptive aria-label.
- Semantics before ARIA: prefer native <button>, <a>, <label>, <table> with accurate accessible names; hide decoration with aria-hidden.
- Skip link: provide "Skip to content" before main.
- Non‑breaking spaces for glued terms and units (e.g., 10\u00A0MB, ⌘\u00A0+\u00A0K).
- Locale aware formats: dates, times, numbers; prefer language detection (Accept-Language, navigator.languages) over IP.

Forms Rules

- Enter submits when a single text input is focused (or on last control for multi‑control forms). In <textarea>, Cmd/Ctrl+Enter submits; Enter inserts newline.
- Every control has a <label> or associated label; clicking label focuses its control. Merge label and control into one generous hit target.
- Submission: keep submit enabled until submission starts; then disable during in‑flight; include idempotency key; show spinner.
- Do not block typing: validate and show feedback; allow any input even for numeric fields and show errors.
- Do not pre‑disable submit: allow submit to surface validation.
- Errors appear next to their fields; on submit, focus the first error.
- Autocomplete and name attributes set for autofill; selectively disable spellcheck for emails, codes, usernames.
- Correct input types and inputmode for keyboards/validation; placeholders end with ellipsis and show example pattern.
- Warn on unsaved changes before navigation.
- Password managers and 2FA: allow paste for one‑time codes; avoid reserved names for non‑auth inputs; use autocomplete tokens (e.g., one-time-code).

Performance Rules

- Test across device/browser matrix (iOS Low Power Mode, macOS Safari). Disable extensions when measuring.
- Track re‑renders; keep controlled loops cheap; prefer uncontrolled inputs when practical.
- Throttle in profiling; batch layout reads/writes; minimize reflows/repaints.
- Latency budgets: POST/PATCH/DELETE < 500 ms.
- Large lists: virtualize (e.g., content-visibility: auto or virtualization libraries).
- Images: preload above‑the‑fold only; lazy‑load the rest; set explicit width/height to avoid CLS.
- Fonts: preload critical text; subset via unicode-range; limit variable axes.
- Networking: preconnect to origins (with crossorigin when needed).
- Offload long tasks to Web Workers; avoid main‑thread blocking work.

Design Rules

- Layered shadows: ambient + direct layers; crisp borders; semi‑transparent borders improve edge clarity.
- Radii: child radius ≤ parent radius; concentric so curves align.
- Hue consistency: tint borders/shadows/text toward background hue.
- Accessible charts: color‑blind‑friendly palettes.
- Contrast: prefer APCA; interaction states increase contrast vs rest state.
- Browser UI theming: <meta name="theme-color" content="#000000"> aligns browser theme; set color-scheme appropriately (e.g., dark) so scrollbars/device UI match.
- Text transforms can affect anti‑aliasing; prefer animating a wrapper; if artifacts persist, promote to layer (e.g., will-change: transform) judiciously.
- Avoid gradient banding (use masks/dithering if needed).

Next.js/React Defaults (Agent Implementations)

- Use next/link for navigation; never a button for routing. Preserve standard behaviors (Cmd/Ctrl+Click, middle‑click, context menu open in new tab).
- Use React.Suspense for spinners with small delays to avoid flicker; streaming routes where appropriate.
- Persist state in URL with reliable helpers (e.g., search param hooks) for tabs, filters, pagination, expanded panels.
- Add <title> and metadata per route; ensure accurate page titles on stateful pages.
- Use CSS for animations (transform/opacity). Guard with @media (prefers-reduced-motion: reduce).
- For modals/drawers: trap focus, restore focus on close, aria-modal, role="dialog", overscroll-behavior: contain, inert siblings where supported.
- For toasts/inline validation: aria-live="polite"; avoid disruptive assertive unless necessary.
- Ensure input font-size ≥ 16 px on mobile, or set viewport <meta> to avoid iOS zoom; prefer proper sizing.

Required CSS/ARIA Patterns (Drop‑in)

1. Focus rings and focus within

```css
/* Visible focus rings */
:focus-visible {
  outline: 2px solid var(--focus-color, #3b82f6);
  outline-offset: 2px;
}

/* Grouped controls */
.has-focus-within:focus-within {
  box-shadow: 0 0 0 2px var(--focus-color, #3b82f6);
}
```

2. Touch and tap hygiene

```css
button,
[role="button"],
a,
input,
select,
textarea {
  touch-action: manipulation;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

/* Minimum hit targets (example) */
.tap-target {
  min-width: 44px;
  min-height: 44px;
}
```

3. Reduced motion guard

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
```

4. Dialog basics

```tsx
// Example with @radix-ui/react-dialog or native <dialog>
// Required: focus trap, initial focus, return focus, aria-modal, role="dialog"
```

5. Loading button pattern

```tsx
type LoadingButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
};

export function LoadingButton({
  isLoading,
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      aria-busy={isLoading || undefined}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <span className="spinner" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
```

6. Live region for async updates

```html
<div aria-live="polite" aria-atomic="true" id="live-region"></div>
```

Copywriting Rules (Agent‑Generated Text)

- Active voice; action‑oriented labels; be clear and concise; use Title Case for headings and buttons.
- Prefer & over and. Keep nouns/terms consistent; write in second person.
- Use consistent placeholders (YOUR_API_TOKEN_HERE; numbers 0123456789). Use numerals for counts.
- Separate numbers and units with a non‑breaking space (10\u00A0MB). Stay consistent with currency formatting within a context (0 or 2 decimals).
- Default to positive, solution‑oriented error copy and include exits/remedies.

Link vs Button Decision

- Use <a>/<Link> for navigation between locations or changing URL.
- Use <button> to perform in‑place actions that do not navigate.

Preflight QA Checklist (Must Pass Before Output)

- Keyboard operability for all flows; visible :focus-visible rings; modals trap/restore focus.
- All navigation uses <a>/<Link>; middle‑click/Cmd+Click open in a new tab.
- Hit targets respect ≥24 px (≥44 px mobile) and have no dead zones.
- URL reflects state (tabs/filters/pagination/expanded panels); supports Back/Forward and share/refresh.
- Loading states use delays/min durations; loading buttons keep their labels and show spinners.
- Destructive actions require confirmation or offer Undo.
- Tooltips are delayed for the first in a group; remove delay for subsequent peers.
- Inputs are hydration‑safe; mobile input font-size ≥16 px (or suitable viewport settings).
- Forms: labels bound; Enter/Cmd+Enter behavior correct; submit enabled until in‑flight; idempotency applied.
- Validation: inline errors next to fields; focus first error on submit; aria-live announcements present.
- Semantics: headings hierarchical; skip link present; icon‑only buttons have aria-label; decorative icons are aria-hidden.
- Animations: respect prefers‑reduced‑motion; only transform/opacity; never transition: all.
- Layout: overflow managed; scrollbars don’t appear accidentally; safe areas respected; responsive across breakpoints.
- Performance: image dimensions set; above‑the‑fold media preloaded sparingly; large lists virtualized; preconnect used appropriately.
- Design: layered shadows, crisp borders, nested radii; interaction states increase contrast; theme-color and color-scheme set appropriately.
- Copy: second person, active voice, concise; numerals for counts; correct placeholders; non‑breaking spaces for units.
- Accessibility tree: accurate names/roles/states; test with screen reader quick checks.
- Locale: date/time/number formatting respects user locale; shortcuts localized/platform‑aware.

Notes for Reviewers

- Prefer minimal changes that bring an implementation into compliance over large refactors.
- If deviating from a rule, include a short rationale in PR description.

Reference

- Vercel Web Interface Guidelines: https://vercel.com/design/guidelines
