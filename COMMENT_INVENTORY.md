# Comment Inventory

Scope: all `.ts`, `.tsx`, `.js`, `.jsx`, `.css` files in the repo, excluding `node_modules`, `dist`, and lockfiles. Nothing was deleted, edited, or reworded — this is a report only.

Only **3 comments** exist in the entire scanned codebase.

## Counts by category

| Category | Count |
|---|---|
| Scaffolding/TODO | 0 |
| Stale | 0 |
| Explains non-obvious logic | 1 |
| Redundant | 2 |
| Uncertain | 0 |

---

## Scaffolding/TODO (0)

None found in `.ts`/`.tsx`/`.js`/`.jsx`/`.css` files.

## Stale (0)

None found.

## Explains non-obvious logic (1)

### `src/pages/Menu.tsx:21-22`
```
// Tracks which items are selected for logging, and their quantities.
// Key = item name, value = quantity. Presence as a key means selected.
```
**Why:** `selectedForLog` is a `Record<string, number>` doing double duty — key presence encodes selection, value encodes quantity. That dual-purpose encoding isn't obvious from the declaration (`useState<Record<string, number>>({})`) or from reading `toggleItemSelected`/`updateItemQuantity` in isolation. Worth keeping.

## Redundant (2)

### `src/pages/Dashboard.tsx:31`
```
// "week" = last 7 days, "month" = last 30 days
```
**Why:** The very next line is `const daysBack = window === "week" ? 7 : 30;` — the ternary already says exactly this. The comment adds the word "days" but the variable name `daysBack` already implies the unit.

### `src/pages/Menu.tsx:25`
```
// Feedback message shown after a log attempt (success or failure).
```
**Why:** Sits directly above `const [logStatus, setLogStatus] = useState<string | null>(null);` — the name `logStatus` combined with where it's set (`"Logged!"` / `"Couldn't log your meal, try again."` in `handleLogSelected`) already makes this plain.

## Uncertain (0)

None — every comment found had a clear category.

---

## Leftover scaffolding that isn't a comment

Not touched, just flagged for your review:

- **`src/api.ts:13-19, 21-29, 41`** — `getLocations` and `getPeriods` are fully implemented and exported (and covered by tests in `src/api.test.ts`), but nothing in the app actually calls either of them outside the test file. `Menu.tsx` only calls `getMenu`. Dead from the app's perspective.
- **`src/pages/Landing.tsx:59-62`** — "Sign in" button has no `onClick`; does nothing.
- **`src/pages/Landing.tsx:63-66`** — "Continue as Guest" button has no `onClick`; does nothing.
- **`src/pages/Landing.tsx:96-98`** — "Get Started" button has no `onClick`; does nothing.
- **`src/pages/Landing.tsx:69-71`** — entire section is a placeholder: `<p className="text-lg font-medium">Stats coming soon</p>`.

Out of scope for this report (not a `.ts/.tsx/.js/.jsx/.css` file) but worth knowing about: `backend/services/dining_service.py:45` has `#TODO: Add Vitamin fields later if needed`.
