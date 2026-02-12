# Accessibility Remediation Tasks

**Source:** [accessibility-audit.md](accessibility-audit.md)
**Total Issues:** 26 across 7 pillars
**Tasks:** 6 batches, each completable within 50% of Opus 4.6's context window

---

## How to Use This Checklist

Each task is self-contained. Copy the task heading into your prompt along with:

> Implement the accessibility fixes described in `docs/accessibility-audit.md` for **Task N**. The checklist is in `docs/accessibility-tasks.md` — tick off each item as you complete it.

---

## Task 1: HTML Foundations & Skip Link

**Files:** `index.html`, `App.tsx`, `App.css`
**Estimated changes:** ~30 lines added/modified
**Difficulty:** Easy

- [x] **§1.1** — Change `<title>` from "vite" to "Weekly Timesheet" in `index.html`
- [x] **§1.2** — Add a "Skip to main content" link at the top of `App.tsx` with `.skip-link` CSS in `App.css`
- [x] **§1.3** — Change `<h1>` from `hidden sm:block` to `sr-only sm:not-sr-only` so it remains accessible on mobile
- [x] **§1.4** — Wrap sidebar nav items in `<ul>`/`<li>` structure inside `<nav>`

---

## Task 2: Keyboard Navigation & Sidebar

**Files:** `App.tsx`
**Estimated changes:** ~40 lines added/modified
**Difficulty:** Medium

- [ ] **§2.1** — Add `aria-label="Main menu"` and `aria-expanded={sidebarOpen}` to the hamburger menu button
- [ ] **§2.2** — Add `aria-label="Previous week"` and `aria-label="Next week"` to chevron navigation buttons
- [ ] **§2.3** — Implement focus management for mobile sidebar: move focus into sidebar on open, return focus to trigger on close, trap focus while open
- [ ] **§2.6** — Make the "click outside" overlay div keyboard-accessible (covered by §2.3 focus trap + §2.4 Escape)

---

## Task 3: User Selector Accessibility

**Files:** `App.tsx`
**Estimated changes:** ~50 lines added/modified
**Difficulty:** Medium–Hard

- [ ] **§2.4** — Add Escape key handler to close the user selector dropdown
- [ ] **§2.5** — Add arrow-key navigation through user list (`role="listbox"` + `role="option"` + arrow key handlers), OR refactor to Headless UI `<Combobox>`
- [ ] **§3.3** — Add full combobox ARIA pattern (`role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `aria-activedescendant`), OR use Headless UI `<Combobox>`
- [ ] **§4.2** — Add `aria-label="Search users"` to the search input
- [ ] **§4.3** — Associate "Timesheet for:" label with user selector via `htmlFor`/`id`

> **Note:** §2.5 and §3.3 overlap — if you refactor to Headless UI `<Combobox>`, both are resolved at once.

---

## Task 4: ARIA Live Regions & Status Announcements

**Files:** `App.tsx`
**Estimated changes:** ~30 lines added/modified
**Difficulty:** Easy–Medium

- [ ] **§3.1** — Wrap the toast notification in a `<div role="status" aria-live="polite">` so screen readers announce success/failure messages
- [ ] **§3.2** — Add `role="status"` and `aria-live="polite"` to the loading spinner container; mark the spinner icon `aria-hidden="true"`
- [ ] **§3.6** — Add `sr-only` text for overtime/total hours status (e.g., "Warning: 45 hours logged, 5 hours overtime")
- [ ] **§3.7** — Add `aria-disabled` and `title` to the submit button explaining why it's disabled when no hours are logged

---

## Task 5: Forms & Contrast

**Files:** `App.tsx`, `App.css`
**Estimated changes:** ~30 lines modified
**Difficulty:** Easy

- [ ] **§4.1** — Associate form labels with inputs via `htmlFor`/`id` pairing in the DayCard component (Project, Hours, Notes)
- [ ] **§4.4** — Add `aria-invalid` and visual error indication when hours are entered without selecting a project
- [ ] **§5.1** — Replace `text-slate-400` with `text-slate-500` (light mode) and `text-white/50` with `text-white/70` (dark mode) for label text to meet 4.5:1 contrast
- [ ] **§5.2** — Improve placeholder contrast: `placeholder:text-slate-300` → `placeholder:text-slate-400`, `placeholder:text-white/30` → `placeholder:text-white/50`

---

## Task 6: Icons, Overlay & Tooling Setup

**Files:** `App.tsx`, `eslint.config.js`, `package.json`, `main.tsx`
**Estimated changes:** ~25 lines added/modified + npm installs
**Difficulty:** Easy

- [ ] **§3.4** — Audit all Lucide icons and confirm/add `aria-hidden="true"` on decorative icons (those next to text labels)
- [ ] **§3.5** — Add `aria-hidden={sidebarOpen}` to main content area when mobile sidebar overlay is open
- [ ] **§6.1** — Audit SVG icons: ensure meaningful icons (e.g., `AlertTriangle`) have accessible names via `aria-label` or paired `sr-only` text
- [ ] **§7.1** — Install `eslint-plugin-jsx-a11y` and add `jsxA11y.configs.flat.recommended` to ESLint config
- [ ] **§7.2** — Install `@axe-core/react` and add dev-only bootstrap in `main.tsx`

---

## Progress Tracker

| Task | Description                    | Status      |
| ---- | ------------------------------ | ----------- |
| 1    | HTML Foundations & Skip Link   | Done        |
| 2    | Keyboard Navigation & Sidebar  | Not Started |
| 3    | User Selector Accessibility    | Not Started |
| 4    | ARIA Live Regions & Status     | Not Started |
| 5    | Forms & Contrast               | Not Started |
| 6    | Icons, Overlay & Tooling Setup | Not Started |

---

## Recommended Order

1. **Task 1** — foundational HTML fixes, easy warm-up
2. **Task 5** — simple label/contrast fixes
3. **Task 4** — ARIA live regions, straightforward additions
4. **Task 2** — keyboard nav requires some state logic
5. **Task 6** — tooling + icon audit
6. **Task 3** — user selector is the most complex (consider Headless UI refactor)
