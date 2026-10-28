---
name: kampanel-module-structure
description: Use when creating or refactoring any feature module in this repository. Follow the merchant-tickets module as the canonical structure, preserve existing UI design, and separate orchestration, table columns, filters, hooks, API queries, types, mappers, and print utilities into the correct files.
---

# Kampanel Module Structure

## Build and Environment Safety

Never run `npm run build` unless the user explicitly requests that exact command. This repository's build script runs an environment-preparation step that overwrites `.env`.

- Use a non-mutating verification command such as `npx vite build --mode uat` when a production compilation check is needed.
- Do not run `npm run env:*`, `scripts/prepare-env.mjs`, or any command that writes `.env` unless the user explicitly asks for an environment change or approves it.
- Before any command that may change environment files, inspect the package script first and tell the user about the expected change.

Use this skill for any new or refactored module under `src/features/**`, especially:

- support pages
- analytics reports
- list/detail pages with filters, drawers, tables, export, or print

The canonical baseline is `src/features/support/merchant-tickets/`.

## Report Loader Pattern

When syncing analytics report loaders with `sslcommerz-kam-panel`, follow this exact pattern:

1. Use the shared page-level `src/features/analytics/reports/components/ReportLoadingOverlay.tsx`.
2. Keep that overlay spinner-only:
   - no loading text
   - no fake section placeholders
   - use the shared `src/components/Loader.tsx`
3. For specialized reports like `merchant-wise` and `merchant-channel-wise`, let the page wrapper own the loader overlay.
4. Inside the specialized report component, return `null` during `isLoading` so the overlay is the only loading UI.
5. Do not add a second inline loader, skeleton, or message inside the specialized report body unless the user explicitly asks for a different loading design.
6. If loader fidelity matters, cross-check both:
   - `sslcommerz-kam-panel/src/components/Loader.tsx`
   - `sslcommerz-kam-panel/src/features/analytics/reports/components/ReportLoadingOverlay.tsx`

Read these first when the module shape is unclear:

- `src/features/support/merchant-tickets/MerchantTicketsPage.tsx`
- `src/features/support/merchant-tickets/components/MerchantTicketTable.tsx`
- `src/features/support/merchant-tickets/components/columns.tsx`
- `src/features/support/merchant-tickets/hooks/useMerchantTickets.ts`

# Core Rules

1. Do not change established design unless the user explicitly asks for it.
2. Follow feature-first structure. Keep logic inside the owning module instead of scattering it across unrelated shared folders.
3. The page or main report file must orchestrate only:
   - hook output
   - local UI state
   - refs and imperative handles
   - top-level layout composition
4. Do not inline large table column definitions in the main page/report file. Put them in `components/columns.tsx`.
5. Do not inline print window HTML in the main page/report file. Put it in `utils/generate<FeatureName>Print.tsx`.
6. Do not mix API response shapes directly into UI components. Map API items to UI rows in `utils/*Mapper.ts` or `utils/mapper.ts`.
7. Keep filter/search-param logic in the feature hook, not in the page component.
8. Use the shared `DataTable` for tabular pages unless the existing feature already uses a different established pattern.
9. Preserve current naming and visible labels unless the user asks to change them.
10. Prefer matching the nearest existing sibling module over inventing a new pattern.
11. Don't change any design, if you don't mapping any value just give "-" or "N/A".
12. Date format will be 15 january 2026 10:15PM.

# Standard Feature Layout

Use only the folders the feature actually needs, but follow this shape by default:

```text
src/features/<domain>/<feature-name>/
├── index.ts
├── <FeaturePage>.tsx
├── api/
│   └── queries.ts
├── components/
│   ├── <Feature>Filters.tsx
│   ├── <Feature>Table.tsx
│   ├── columns.tsx
│   └── <Feature>Drawer.tsx
├── constants/
│   └── filterFallback.ts
├── hooks/
│   └── use<Feature>.ts
├── types/
│   └── index.ts
└── utils/
    └── <feature>Mapper.ts
```

Notes:

- `index.ts` should export the main page and only the pieces that are intentionally reused elsewhere.
- Add `constants/` only if the feature has fallback values, presets, or module-specific config.
- Add drawer/detail components only when the feature actually has that interaction.

# Analytics Report Layout

Reports should follow the same separation, with report-specific utilities added when needed:

```text
src/features/analytics/reports/<reportName>/
├── <ReportName>.tsx
├── api/
│   └── queries.ts
├── components/
│   ├── <ReportName>Filters.tsx
│   ├── <ReportName>Table.tsx
│   └── columns.tsx
├── hooks/
│   └── use<ReportName>.ts
├── types/
│   └── index.ts
└── utils/
    ├── mapper.ts
    └── generate<ReportName>Print.tsx
```

Report-specific rules:

- If the report is printable, create `generate<ReportName>Print.tsx`.
- If the report uses `DataTable`, extract columns into `components/columns.tsx`.
- Keep print/export wiring in the main report file through the ref handle, but keep the heavy implementation outside it.
- Do not place print markup or status-badge mapping logic inline in the report component.
- If the report needs only a compact live table, prefer a dedicated table component unless the existing report family already renders `DataTable` directly in the report file.

# File Responsibilities

## `<FeaturePage>.tsx` or `<ReportName>.tsx`

Owns composition only:

- call the feature hook
- pass data to filters/table/drawers
- expose `exportData` and `printData` through `forwardRef` when needed
- keep small helper functions only if they are trivial and truly local

Avoid putting these here:

- large columns arrays
- API response mapping
- print HTML generation
- search-param hydration logic

## `components/columns.tsx`

Put all `ColumnDef[]` creation here.

Rules:

- export a named builder like `getMerchantTicketColumns` or `getSettlementBounceReportColumns`
- keep feature-specific badge/render helpers here when they are used only by the columns
- the table component should call it with `useMemo`

## `components/<Feature>Table.tsx`

Owns:

- `DataTable` rendering
- loading skeleton/empty loading state
- `externalPagination`
- table-only toolbar actions for that feature

Rules:

- keep it presentational
- receive already-mapped rows and callback props
- do not fetch data here

## `components/<Feature>Filters.tsx`

Owns:

- filter form UI
- local control rendering
- apply/clear interactions coming from the hook

Rules:

- use backend filter metadata when the API provides it
- for select filters, if metadata `default_value` contains an actual option key then show that option as selected by default; if `default_value` is `null`, `undefined`, or empty then show the placeholder instead
- when a select filter has any selected value, display that option label and apply the active/highlighted selected styling consistently with sibling modules
- when a local filter value changes, the Apply Filters button should become active based on a real comparison against the applied URL/filter state; do not treat a selected value like `all` as unchanged unless it is also the applied value
- when Apply Filters is clicked, send the selected filter values to the server exactly as chosen by the user unless the backend contract explicitly requires a different normalization
- never auto-send backend `default_value` or `default_values` filter params on first page load; keep them out of URL hydration and request params until the user explicitly applies them, with `page` and `per_page` as the only safe default hydration unless the backend contract requires otherwise
- for metadata-driven select filters, normalize empty-string "All ..." options into a real option value such as `all` before rendering or comparing selected state, so the UI does not mistake them for placeholders
- do not force `all` into URL hydration just because a select field exists; only hydrate a select default when metadata actually provides a real non-null default value
- if legacy URLs already contain `key=all` for a select field whose metadata default is `null`, apply a one-time cleanup so the filter returns to placeholder state by default
- when deriving request params, discover select keys from the feature's filter metadata or fallback field definitions instead of hardcoding only one key like `status`; this is required for fields such as `query_for`
- apply the same select/default/highlight/change-detection rules to both primary filters and advanced filters, because both must share the same local filter state and request-building logic
- do not duplicate query-building logic here
- if a feature uses `date_preset` with `custom_range`, follow `merchant-tickets`:
  render a dedicated date dropdown outside the generic `FilterBar`, always show the inline custom-range panel inside that dropdown, and let the date inputs switch the local preset to `custom_range` before apply

## `hooks/use<Feature>.ts`

Owns:

- URL search param hydration
- default params and fallback handling
- filter state and apply/clear/page handlers
- preparing query params
- invoking query hooks
- mapping API payloads to rows
- returning stable UI-friendly state

Rules:

- keep `enabled` passed to React Query strictly boolean
- normalize `all`, empty strings, and custom date ranges here
- build pagination output in the shape expected by `DataTable`

## `api/queries.ts`

Owns:

- endpoint-specific query hooks
- request parameter typing
- React Query keys and fetch calls

Rules:

- keep raw server contract knowledge here
- do not format display values here

## `types/index.ts`

Owns:

- raw API item/response types
- filter field metadata types
- mapped row types when needed
- table prop types when they are feature-specific

Rules:

- separate API field names from UI field names
- keep types colocated with the feature

## `utils/mapper.ts` or `utils/<feature>Mapper.ts`

Owns:

- raw API item to UI row transformation
- value normalization
- safe fallbacks for missing data
- formatting that is part of the row model

Rules:

- no JSX here
- prefer one exported mapper per item plus one list helper when useful

## `utils/generate<ReportName>Print.tsx`

Owns:

- print-only markup
- print-only badge/status class mapping
- `window.open`, `window.print`, and print stylesheet logic

Rules:

- print preview should contain only the content intended for printing
- remove export/view-column/edit actions from print output unless explicitly requested
- keep the title and table aligned with the approved page behavior

# Naming Rules

- Match the existing feature name exactly in filenames and exported symbols.
- Use PascalCase for page/component/report files.
- Use `use<Feature>.ts` for hooks.
- Use `columns.tsx` for table columns.
- Use `queries.ts` for React Query hooks.
- Use `mapper.ts` or `<feature>Mapper.ts` for API-to-UI transformation.
- Use `generate<FeatureName>Print.tsx` for print helpers.
- Use `types/index.ts` for module-local types.

# Workflow

1. Inspect the nearest existing module.
2. Prefer the merchant ticket structure unless the surrounding feature family already has a stronger local pattern.
3. Scaffold missing folders before adding logic.
4. Move table columns out of the page/report and into `components/columns.tsx`.
5. Move API-to-row mapping into `utils/mapper.ts`.
6. Move print generation into `utils/generate<FeatureName>Print.tsx` when printing exists.
7. Keep filter and pagination state inside the feature hook.
8. Keep the visible UI unchanged unless the task explicitly requests design work.
9. Validate with `npm run build` after structural refactors.

# Report Loader Pattern

When syncing an analytics report loader to `sslcommerz-kam-panel`, follow this exact pattern:

1. Reuse the shared `src/components/Loader.tsx` and keep it visually aligned with the source project's `Loader.tsx` and spinner CSS.
2. Reuse `src/features/analytics/reports/components/ReportLoadingOverlay.tsx` as the page-level report-card overlay.
3. For reports that should match the sslcommerz loading flow, let the page wrapper render the overlay and make the report component return `null` while `isLoading` is true.
4. Do not render a second in-component loader, loading text, skeleton section list, or placeholder card stack when the shared report overlay is active.
5. If the user asks for a text-free loader, keep only the centered branded spinner in `ReportLoadingOverlay.tsx`.
6. For merchant-wise-style reports, verify the loading state against:
   - `src/features/analytics/reports/ReportDetailPage.tsx`
   - `src/features/analytics/reports/components/ReportLoadingOverlay.tsx`
   - the source `sslcommerz-kam-panel` loader and report-card structure
