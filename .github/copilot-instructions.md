# Copilot Instructions for physique57-insight-hub-0001

## Project Architecture & Patterns
- **Stack:** Vite + React + TypeScript + Tailwind CSS + shadcn-ui. All UI is in `/src/components/`, with dashboards in `/src/components/dashboard/`.
- **Pages:** Route-level pages are in `/src/pages/`. Each page composes dashboard components and hooks.
- **Data Flow:** Data is loaded via custom React hooks (e.g., `useSalesData`, `useNewClientData`, `useGoogleSheets`). These hooks fetch, normalize, and memoize data for dashboard components.
- **Analytics:** Major analytics tables (e.g., sales, discounts, client conversion) use custom table components (e.g., `ModernDataTable`, `MonthOnMonthTable`, `EnhancedYearOnYearTable`). Drill-down modals are triggered by row/cell clicks and always receive filtered, relevant data.
- **Styling:** All UI uses Tailwind CSS with a strong emphasis on dark, animated gradient headers, sticky headers/columns, and consistent card/table layouts. Animated icons are used in table headers. Totals rows are present in all analytics tables.
- **Tabs/Filters:** Tab navigation and filters use shadcn-ui primitives, styled with gradients and consistent spacing. Location tabs always show all locations.

## Developer Workflows
- **Start Dev Server:** `npm run dev` (auto-reloads, instant preview)
- **Install Dependencies:** `npm i`
- **Build for Production:** `npm run build`
- **Lint:** `npx eslint .`
- **No custom test runner is present.**
- **Deploy:** Use Lovable's Share -> Publish, or see README for custom domain setup.

## Project-Specific Conventions
- **Data Normalization:** All data from Google Sheets or APIs is normalized to camelCase and mapped to TypeScript interfaces in `/src/types/`.
- **Drill-Down Analytics:** All drill-downs (modals, "View Details") must show only the relevant filtered data for the clicked row/metric, never the full dataset.
- **Sticky Headers/Columns:** All analytics tables use sticky headers and left columns for usability.
- **Animated Loader:** Loader bar animates left-to-right once, then right-to-left as the page loads. Loader code is in `/src/components/ui/RefinedLoader.tsx` (see comments for required CSS).
- **Consistent Theming:** All cards, tables, tabs, and filters use a unified, modern, dark-gradient theme with animated icons and rounded corners.
- **Location Handling:** Location selectors/tabs always show all three locations, deduplicated and styled.

## Integration Points
- **Google Sheets:** Data is fetched from Google Sheets using custom hooks (see `/src/hooks/`).
- **Lovable Platform:** Project is integrated with Lovable for instant preview, deployment, and domain management.

## Examples
- See `/src/components/dashboard/MonthOnMonthTable.tsx` and `/src/components/dashboard/EnhancedYearOnYearTable.tsx` for sticky headers, totals rows, and drill-down logic.
- See `/src/components/dashboard/UnifiedTopBottomSellers.tsx` for Top/Bottom lists with View Details drill-down.
- See `/src/components/ui/RefinedLoader.tsx` for loader implementation and required CSS.

---

If you are unsure about a pattern, check the corresponding dashboard/table component in `/src/components/dashboard/` and the README for workflow basics. Always follow the dark-gradient, sticky-header, and drill-down conventions.
