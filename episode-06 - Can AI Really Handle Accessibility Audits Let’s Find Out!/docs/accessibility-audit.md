# Accessibility Audit Report

**Application:** Weekly Timesheet (Power Apps Code App)
**Date:** February 6, 2026
**Standard:** WCAG 2.1 AA
**Files Audited:** `index.html`, `App.tsx`, `App.css`, `index.css`, `main.tsx`, `PowerProvider.tsx`, `ThemeProvider.tsx`

---

## Summary

| Category            | Issues Found | Severity    |
| ------------------- | ------------ | ----------- |
| Semantic HTML       | 4            | Medium–High |
| Keyboard Navigation | 6            | High        |
| ARIA Attributes     | 7            | High        |
| Forms & Inputs      | 4            | Medium      |
| Color & Contrast    | 2            | Medium      |
| Images & Media      | 1            | Low         |
| Testing & Tooling   | 2            | Medium      |
| **Total**           | **26**       |             |

---

## What's Working Well

- **Semantic landmarks** – `<header>`, `<main>`, `<footer>`, `<aside>`, and `<nav>` are all used correctly.
- **Focus-visible styles** – Global `*:focus-visible` rule provides a visible focus ring (`App.css`).
- **Theme toggle** – Has a proper `aria-label` that updates based on current mode.
- **Project selector** – Uses Headless UI `<Listbox>` which provides built-in ARIA compliance.
- **Color is not used alone** – Status indicators include text labels and icons alongside color. Overtime uses both red color and an `AlertTriangle` icon. "Today" uses a badge label, not just a colored bar.
- **`lang="en"` on `<html>`** – Correct language attribute is set in `index.html`.
- **System theme preference** – Respects `prefers-color-scheme` via `ThemeProvider.tsx`.

---

## Pillar 1: Semantic HTML

### 1.1 — Page title is non-descriptive (Medium)

**File:** `index.html`, Line 6
**Issue:** `<title>vite</title>` is a generic build-tool name, not a meaningful page title.
**Impact:** Screen readers announce "vite" as the page name, giving users no context.
**WCAG:** 2.4.2 Page Titled (Level A)

**Recommendation:**

```html
<title>Weekly Timesheet</title>
```

---

### 1.2 — No skip link (High)

**File:** `App.tsx`
**Issue:** There is no "Skip to main content" link. Keyboard users must tab through the entire sidebar navigation before reaching the timesheet content.
**WCAG:** 2.4.1 Bypass Blocks (Level A)

**Recommendation:**

```jsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
{/* ... sidebar and header ... */}
<main id="main-content">
```

```css
.skip-link {
	position: absolute;
	top: -40px;
	left: 0;
	background: #000;
	color: #fff;
	padding: 8px 16px;
	z-index: 100;
}
.skip-link:focus {
	top: 0;
}
```

---

### 1.3 — `<h1>` hidden on mobile (Medium)

**File:** `App.tsx`, Line ~1064
**Issue:** The `<h1>Weekly Timesheet</h1>` has `hidden sm:block`, so on mobile viewports there is no visible or accessible heading level 1.
**WCAG:** 1.3.1 Info and Relationships (Level A)

**Recommendation:** Use `sr-only` instead of `hidden` on mobile so the heading remains accessible to screen readers:

```jsx
<h1 className="text-xl font-bold text-slate-900 dark:text-white sm:not-sr-only sr-only">
	Weekly Timesheet
</h1>
```

---

### 1.4 — Navigation items not structured as a list (Low)

**File:** `App.tsx`, Lines ~975–1002
**Issue:** Sidebar navigation items (Dashboard, Reports, Settings) are rendered as direct `<button>` children of `<nav>` without an enclosing `<ul>`/`<li>` structure.
**Impact:** Screen readers won't announce the count of navigation items (e.g., "navigation, list, 3 items").
**WCAG:** 1.3.1 Info and Relationships (Level A)

**Recommendation:**

```jsx
<nav aria-label="Main navigation">
  <ul className="space-y-2">
    {items.map((item) => (
      <li key={item.label}>
        <button ...>{item.label}</button>
      </li>
    ))}
  </ul>
</nav>
```

---

## Pillar 2: Keyboard Navigation

### 2.1 — Mobile menu button missing `aria-expanded` and `aria-label` (High)

**File:** `App.tsx`, Lines ~1042–1052
**Issue:** The hamburger menu button toggles the sidebar but does not communicate its expanded/collapsed state to assistive technology, and has no accessible name.
**WCAG:** 4.1.2 Name, Role, Value (Level A)

**Recommendation:**

```jsx
<button
  onClick={() => setSidebarOpen(!sidebarOpen)}
  aria-label="Main menu"
  aria-expanded={sidebarOpen}
  className="lg:hidden ..."
>
```

---

### 2.2 — Week navigation buttons missing `aria-label` (Medium)

**File:** `App.tsx`, Lines ~1072–1095
**Issue:** Previous/next week buttons only contain `<ChevronLeft>` / `<ChevronRight>` icons. Screen readers will announce them as empty buttons.
**WCAG:** 4.1.2 Name, Role, Value (Level A)

**Recommendation:**

```jsx
<button aria-label="Previous week" ...>
  <ChevronLeft className="w-5 h-5" />
</button>
<button aria-label="Next week" ...>
  <ChevronRight className="w-5 h-5" />
</button>
```

---

### 2.3 — Sidebar focus management (High)

**File:** `App.tsx`, Lines ~935–960
**Issue:** When the mobile sidebar opens, focus is not moved into it. When it closes, focus is not returned to the trigger button. Users can tab into content behind the overlay.
**WCAG:** 2.4.3 Focus Order (Level A)

**Recommendation:** When the sidebar opens, move focus to the first focusable element inside it. On close, return focus to the menu button. Consider trapping focus within the sidebar while it is open (similar to modal pattern from the skill guide).

---

### 2.4 — User selector Escape key support (Medium)

**File:** `App.tsx`, Lines ~255–356
**Issue:** The custom user selector dropdown can only be closed by clicking outside. Pressing Escape does not close it.
**WCAG:** 2.1.1 Keyboard (Level A)

**Recommendation:** Add an `onKeyDown` handler to close the dropdown when Escape is pressed:

```jsx
useEffect(() => {
  if (!isOpen) return;
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen]);
```

---

### 2.5 — User selector missing keyboard list navigation (Medium)

**File:** `App.tsx`, Lines ~255–356
**Issue:** The user selector does not support arrow-key navigation through the list of users. Users must Tab through each item.
**WCAG:** 2.1.1 Keyboard (Level A)

**Recommendation:** Implement `role="listbox"` with `role="option"` on items, and support arrow-up/down to move focus, plus Enter to select. Alternatively, refactor to use Headless UI `<Combobox>` which provides this out of the box.

---

### 2.6 — "Click outside to close" overlay not keyboard accessible (Low)

**File:** `App.tsx`, Line ~350
**Issue:** The invisible overlay `<div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />` catches clicks but is not keyboard accessible.
**Impact:** Low severity since Escape support (2.4) would resolve this for keyboard users.

---

## Pillar 3: ARIA Attributes

### 3.1 — Toast notification missing live region (High)

**File:** `App.tsx`, Lines ~119–143
**Issue:** The toast ("Timesheet submitted successfully!") appears and disappears visually, but has no `role="status"` or `aria-live` attribute. Screen reader users will not be informed of the success message.
**WCAG:** 4.1.3 Status Messages (Level AA)

**Recommendation:**

```jsx
<div role="status" aria-live="polite">
  <AnimatePresence>
    {show && (
      <motion.div ...>
        ...
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

---

### 3.2 — Loading state not announced (Medium)

**File:** `App.tsx`, Lines ~1220–1228
**Issue:** The loading spinner with "Loading timesheet data..." text is displayed visually but not announced to screen readers as a live status update.
**WCAG:** 4.1.3 Status Messages (Level AA)

**Recommendation:**

```jsx
<div
	role="status"
	aria-live="polite"
	className="flex items-center justify-center py-20"
>
	<div className="flex flex-col items-center gap-4">
		<Loader2
			className="w-10 h-10 text-indigo-500 animate-spin"
			aria-hidden="true"
		/>
		<p>Loading timesheet data...</p>
	</div>
</div>
```

---

### 3.3 — User selector missing combobox ARIA pattern (High)

**File:** `App.tsx`, Lines ~255–356
**Issue:** The custom user selector functions as a combobox (searchable dropdown) but lacks the required ARIA attributes: `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `aria-activedescendant`, and `role="option"` on items.
**WCAG:** 4.1.2 Name, Role, Value (Level A)

**Recommendation:** Either add the full ARIA combobox pattern or replace with Headless UI `<Combobox>`, which handles this automatically.

---

### 3.4 — Decorative icons missing `aria-hidden` (Low)

**File:** `App.tsx` (throughout)
**Issue:** Lucide React icons used alongside text (e.g., `<Clock>` next to "40h", `<Sparkles>` next to "Submit for Approval") are not explicitly marked `aria-hidden="true"`. While lucide-react v0.56+ may set this by default, it should be confirmed.
**WCAG:** 1.3.1 Info and Relationships (Level A)

**Recommendation:** Verify lucide-react sets `aria-hidden="true"` by default. If not, add it to all decorative icon instances:

```jsx
<Clock className="w-4 h-4" aria-hidden="true" />
```

---

### 3.5 — Sidebar mobile overlay missing `aria-hidden` on background (Low)

**File:** `App.tsx`, Lines ~935–945
**Issue:** When the mobile sidebar overlay is active, the main content behind it is still accessible to screen readers.

**Recommendation:** Add `aria-hidden="true"` to the main content area when the sidebar overlay is open:

```jsx
<div className="lg:pl-64" aria-hidden={sidebarOpen}>
```

---

### 3.6 — Overtime/total hours status not conveyed to screen readers (Medium)

**File:** `App.tsx`, Lines ~1098–1115
**Issue:** The total hours badge changes color when overtime is detected, but the overtime status is only conveyed visually (red color + triangle icon). Screen readers don't receive a text description.
**WCAG:** 1.3.1 Info and Relationships (Level A)

**Recommendation:** Add `sr-only` text:

```jsx
<span className="sr-only">
	{isOvertime
		? `Warning: ${totalHours} hours logged, ${totalHours - 40} hours overtime`
		: `${totalHours} of 40 hours logged`}
</span>
```

---

### 3.7 — Submit button disabled state not explained (Low)

**File:** `App.tsx`, Lines ~1309–1345
**Issue:** The submit button is disabled when no hours are logged, but there is no tooltip or screen-reader text explaining why.
**WCAG:** 3.3.1 Error Identification (Level A)

**Recommendation:**

```jsx
<button
  disabled={isSubmitted || totalHours === 0}
  aria-disabled={isSubmitted || totalHours === 0}
  title={totalHours === 0 ? "Log hours before submitting" : undefined}
>
```

---

## Pillar 4: Forms & Inputs

### 4.1 — Form labels not explicitly associated (Medium)

**File:** `App.tsx`, DayCard component, Lines ~465–530
**Issue:** The labels for "Project", "Hours", and "Notes" use `<label>` tags but are not connected to their inputs via `htmlFor`/`id` pairing. They rely on visual proximity only.
**WCAG:** 1.3.1 Info and Relationships (Level A), 4.1.2 Name, Role, Value (Level A)

**Recommendation:**

```jsx
<label htmlFor={`hours-${entry.id}`}>Hours</label>
<input id={`hours-${entry.id}`} type="number" ... />

<label htmlFor={`notes-${entry.id}`}>Notes</label>
<textarea id={`notes-${entry.id}`} ... />
```

---

### 4.2 — User search input missing label (Medium)

**File:** `App.tsx`, Lines ~290–305
**Issue:** The search input in the user selector has a `placeholder="Search users..."` but no associated label or `aria-label`.
**WCAG:** 1.3.1 Info and Relationships (Level A)

**Recommendation:**

```jsx
<input
  type="text"
  aria-label="Search users"
  placeholder="Search users..."
  ...
/>
```

---

### 4.3 — "Timesheet for" label not associated with UserSelector (Medium)

**File:** `App.tsx`, Lines ~1200–1215
**Issue:** The label "Timesheet for:" is a separate `<label>` element not connected to the `UserSelector` component via `htmlFor`.
**WCAG:** 1.3.1 Info and Relationships (Level A)

**Recommendation:** Add an `id` to the user selector trigger button and reference it from the label:

```jsx
<label htmlFor="user-selector">Timesheet for:</label>
<UserSelector id="user-selector" ... />
```

---

### 4.4 — No form validation feedback for entries (Low)

**File:** `App.tsx`
**Issue:** If a user enters hours but doesn't select a project, there is no error indication or `aria-invalid` feedback. The entry will be silently skipped on submission.
**WCAG:** 3.3.1 Error Identification (Level A)

**Recommendation:** Add visual and aria-based validation indicating that a project is required when hours are entered.

---

## Pillar 5: Color & Contrast

### 5.1 — Low-contrast label text (Medium)

**File:** `App.tsx` (throughout)
**Issue:** Several labels use `text-slate-400` (light mode) and `text-white/50` (dark mode). These colors may fall below the 4.5:1 contrast ratio on their respective backgrounds.

- `text-slate-400` (#94a3b8) on white (#ffffff) = ~3.0:1 ❌
- `text-white/50` on dark slate backgrounds ≈ ~3.5:1 ❌
  **WCAG:** 1.4.3 Contrast (Minimum) (Level AA)

**Recommendation:** Use `text-slate-500` (light) and `text-white/70` (dark) for small label text to achieve at least 4.5:1.

---

### 5.2 — Placeholder text contrast (Low)

**File:** `App.tsx`, DayCard component
**Issue:** `placeholder:text-slate-300` and `placeholder:text-white/30` are very low contrast. While placeholders are not required to meet contrast minimums per WCAG, improving them benefits users with low vision.

**Recommendation:** Use `placeholder:text-slate-400` and `placeholder:text-white/50` as a minimum.

---

## Pillar 6: Images & Media

### 6.1 — SVG icon accessibility (Low)

**File:** `App.tsx` (throughout)
**Issue:** The app uses lucide-react SVG icons throughout. Icons that convey meaning (e.g., `<AlertTriangle>` for overtime) should have accessible names, while decorative icons should be hidden.
**WCAG:** 1.1.1 Non-text Content (Level A)

**Recommendation:** Audit all icon usage:

- **Decorative** (next to text): Add `aria-hidden="true"`
- **Meaningful** (standalone, conveys info): Add `aria-label` or pair with `sr-only` text

---

## Pillar 7: Testing & Tooling

### 7.1 — No accessibility linting configured (Medium)

**File:** `eslint.config.js`, `package.json`
**Issue:** `eslint-plugin-jsx-a11y` is not installed or configured. Accessibility issues won't be caught during development.

**Recommendation:**

```bash
npm install --save-dev eslint-plugin-jsx-a11y
```

Add to ESLint config:

```js
import jsxA11y from 'eslint-plugin-jsx-a11y'
// ...
extends: [
  // ...existing extends
  jsxA11y.configs.flat.recommended,
],
```

---

### 7.2 — No automated accessibility tests (Medium)

**File:** `package.json`
**Issue:** No accessibility testing library (e.g., `jest-axe`, `@axe-core/react`) is installed.

**Recommendation:** Add `@axe-core/react` for development-time a11y warnings:

```bash
npm install --save-dev @axe-core/react
```

```tsx
// In main.tsx (development only)
if (import.meta.env.DEV) {
	import("@axe-core/react").then((axe) => {
		axe.default(React, ReactDOM, 1000)
	})
}
```

---

## Priority Remediation Plan

### Critical (Fix First)

1. Add skip link (§1.2)
2. Add `aria-label` and `aria-expanded` to mobile menu button (§2.1)
3. Add `aria-label` to week navigation buttons (§2.2)
4. Add `role="status"` / `aria-live` to toast (§3.1)
5. Associate form labels with inputs via `htmlFor`/`id` (§4.1)

### High Priority

6. Add Escape key support to user selector (§2.4)
7. Add ARIA combobox pattern or use Headless UI Combobox for user selector (§3.3)
8. Fix sidebar focus management on mobile (§2.3)
9. Add `aria-label` to user search input (§4.2)
10. Announce loading state to screen readers (§3.2)

### Medium Priority

11. Fix page title (§1.1)
12. Make `<h1>` accessible on mobile (§1.3)
13. Add navigation list structure (§1.4)
14. Add overtime screen-reader text (§3.6)
15. Fix low-contrast label text (§5.1)
16. Install `eslint-plugin-jsx-a11y` (§7.1)
17. Add `@axe-core/react` for dev-time checks (§7.2)

### Low Priority

18. Add `aria-hidden` to decorative icons (§3.4)
19. Improve placeholder contrast (§5.2)
20. Add form validation feedback (§4.4)
21. Add disabled state explanation to submit button (§3.7)
