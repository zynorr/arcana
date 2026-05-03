# Arcana Frontend Handoff

## Project Summary

Arcana is a monitoring and analytics dashboard for Stylus contracts on Arbitrum One.
The frontend is a Next.js app that surfaces:

- global analytics for indexed chain activity
- monitored dApp registry and per-dApp detail views
- explorer search for transactions, blocks, and addresses
- alert rule management and alert history
- Stylus-specific analytics
- system and collector health

The frontend lives in `packages/dashboard` and depends on a Fastify API plus WebSocket updates.

## Product Goals For The UI

The interface should feel:

- technical and trustworthy
- fast to scan
- polished enough for demos
- consistent across all pages
- resilient when data is sparse, loading, or partially synced

The current app already has the right information architecture. The main need is visual and component-system cleanup rather than a navigation rethink.

## Frontend Stack

- Next.js 15
- React 19
- Tailwind CSS
- Recharts
- Lucide React
- client-side fetches against `NEXT_PUBLIC_API_URL`
- WebSocket updates against `NEXT_PUBLIC_WS_URL`

Key files:

- `packages/dashboard/src/app/layout.tsx`
- `packages/dashboard/src/app/globals.css`
- `packages/dashboard/src/components/AppShell.tsx`
- `packages/dashboard/src/lib/api.ts`
- `packages/dashboard/src/hooks/useMetrics.ts`
- `packages/dashboard/src/hooks/useWebSocket.ts`

## Current Route Map

- `/`
  - overview dashboard
  - strongest current visual direction
- `/dapps`
  - monitored dApp registry
  - add dApp flow
- `/dapps/[id]`
  - dApp detail, backfill status, charts, recent events
- `/explorer`
  - transactions, blocks, events, search landing
- `/alerts`
  - alert creation, alert list, alert history
- `/stylus`
  - Stylus vs EVM charts and contract table
- `/ops`
  - API, DB, Redis, collector, and backfill health

## Current UI Reality

There are two visual systems in the app today.

### Newer direction

Best examples:

- `packages/dashboard/src/app/page.tsx`
- `packages/dashboard/src/components/AppShell.tsx`
- `packages/dashboard/src/app/ops/page.tsx`

Characteristics:

- glass panels
- soft borders
- large radii
- gradient mesh backgrounds
- heavier typographic hierarchy
- stronger use of spacing and negative space

### Older direction

Most visible in:

- `packages/dashboard/src/app/dapps/page.tsx`
- `packages/dashboard/src/app/dapps/[id]/page.tsx`
- `packages/dashboard/src/app/explorer/page.tsx`
- `packages/dashboard/src/app/alerts/page.tsx`
- `packages/dashboard/src/app/stylus/page.tsx`
- `packages/dashboard/src/components/charts/*.tsx`

Characteristics:

- legacy `card`, `card-header`, `card-value`, and `badge` usage
- flatter surfaces
- older `arcana-*` accent palette
- less consistent spacing and typography

Important note:
those legacy classes are used heavily, but they are not cleanly defined as a shared design system in `globals.css`. That is the biggest cleanup opportunity.

## Design Direction To Preserve

Keep:

- dark technical dashboard mood
- premium “glass + glow” direction from the homepage
- top nav + left target rail + mobile bottom nav layout
- strong data density
- visible realtime / monitoring character

Improve:

- consistency across pages
- chart framing and legends
- form styling
- empty, loading, and error states
- page-level hierarchy
- component reuse

Avoid:

- generic SaaS white-label look
- default Tailwind “card on dark bg” repetition
- introducing a third visual style

## Shared Component System To Build

The cleanup should start by introducing real shared primitives, then migrating pages onto them.

Suggested primitives:

- `PageHeader`
  - title, subtitle, actions, optional range controls
- `Panel`
  - base container replacing ad hoc `card` and `glass-card`
- `StatCard`
  - metric title, value, delta, helper text, icon, accent
- `SectionTitle`
  - small reusable section heading row
- `DataTable`
  - consistent table spacing, headers, row hover, empty state
- `Badge`
  - status, severity, protocol type, queue state
- `Button`
  - primary, secondary, quiet, destructive
- `Input`, `Textarea`, `Select`
  - normalized forms across registry and alerts
- `EmptyState`
  - no data, no dApps, no search result, no events
- `LoadingSkeleton`
  - page and panel variants
- `StatusPill`
  - backfill, collector, alert, transaction state
- `ChartPanel`
  - title, subtitle, legend slot, action slot, chart area

## Priority Refactor Order

### 1. Establish primitives and tokens

Do this first:

- unify colors, radii, borders, and spacing in `globals.css` and `tailwind.config.js`
- replace implicit one-off styles with shared components
- formalize typography roles for:
  - page title
  - section title
  - metric label
  - body copy
  - mono metadata

### 2. Normalize the shell

Refine `AppShell` only after shared primitives exist.

Focus on:

- spacing rhythm
- selected/hover states
- mobile nav clarity
- dApp target list presentation
- search result popup polish

### 3. Migrate page surfaces

Recommended order:

1. `/dapps`
2. `/dapps/[id]`
3. `/alerts`
4. `/explorer`
5. `/stylus`
6. `/ops`

Reason:

- registry and dApp detail are core product flows
- alerts and explorer are high-value but visually inconsistent
- stylus page still works functionally but looks older
- ops is already closer to the newer look

### 4. Normalize charts last

Charts are already functional. The main gains are in:

- panel framing
- legends
- tooltip styling
- axis label consistency
- sparse-data empty states

Avoid changing chart data contracts unless necessary.

## Functional Constraints

The UI cleanup should preserve these working flows:

- add dApp
- archive dApp
- global search into explorer
- alert create / toggle / delete
- backfill progress display
- ops health visibility

These flows are covered by Playwright smoke tests in:

- `tests/e2e/smoke.spec.ts`

Keep the existing `data-testid` hooks unless tests are updated at the same time.

Important test hooks:

- `global-search-input`
- `global-search-result`
- `toggle-dapp-form`
- `dapp-name-input`
- `dapp-addresses-input`
- `submit-dapp-form`
- `archive-dapp-button`
- `backfill-status-panel`
- `toggle-alert-form`
- `alert-metric-select`
- `alert-condition-select`
- `alert-threshold-input`
- `alert-window-select`
- `submit-alert-form`
- `alert-rule-*`
- `alert-toggle-*`
- `alert-delete-*`

## Data And Realtime Constraints

The frontend is not a static mock. A redesign has to respect these runtime realities:

- most pages are client-rendered
- most data comes from `packages/dashboard/src/lib/api.ts`
- several views poll every 30 seconds
- some views also refresh from WebSocket events
- newly added dApps may be in backfill states before they have full data
- sparse datasets are normal for some monitored contracts

Design for:

- loading
- stale-but-usable data
- empty datasets
- partial backfill completion
- API error recovery

## Page-Specific Notes

### Overview

- This is the visual reference page.
- Keep the “hero + insight cards + large comparison chart + narrative insight” structure.
- It can be simplified slightly, but it should remain the flagship page.

### Registry

- Needs stronger card hierarchy and better form styling.
- This page should feel like a monitoring setup surface, not a plain CRUD list.

### dApp Detail

- Needs better organization between:
  - header
  - backfill status
  - top metrics
  - charts
  - recent events
- This is a key page for trust and should feel more operational.

### Explorer

- Needs the cleanest information density work.
- Think “developer console” rather than “marketing dashboard”.
- Search result context and tab states should feel more explicit.

### Alerts

- Forms and rule rows should look more intentional.
- Status states should be clearer at a glance.

### Stylus

- Charts are useful but feel older.
- Good candidate for unifying around `ChartPanel`, `StatCard`, and `DataTable`.

### Ops

- Already close to the target direction.
- Mostly needs consistency with the new component set.

## Suggested Definition Of Done

A strong UI cleanup is done when:

- the app looks like one coherent product
- `card` and `badge` ad hoc styling has been replaced by shared primitives
- registry, dApp detail, alerts, explorer, stylus, and ops visually match the homepage shell quality
- empty/loading/error states are intentional across routes
- mobile nav and desktop shell both feel finished
- smoke tests still pass

## Recommended Working Style

- start with design tokens and components
- migrate one route at a time
- keep behavior unchanged unless there is a clear UX bug
- run smoke tests after each major route conversion
- treat the homepage and shell as the design source of truth

