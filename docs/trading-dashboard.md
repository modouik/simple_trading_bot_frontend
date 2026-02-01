# Trading Dashboard Architecture

## Page Architecture

### Executive Overview
- Route: `/[lng]/trading/overview`
- Purpose: KPI summary, equity/drawdown curves, bot vs market, suggestions.

### Sessions
- Route: `/[lng]/trading/sessions`
- Purpose: list sessions with filters, actions (view, compare, export).

### Session Detail
- Route: `/[lng]/trading/sessions/[id]`
- Purpose: equity/drawdown charts, price + orders overlay, metrics, orders timeline, suggestions.

### Trades
- Route: `/[lng]/trading/trades`
- Purpose: cross-session trades table and distribution chart.

### Comparison
- Route: `/[lng]/trading/comparison`
- Purpose: multi-session overlay and metrics table.

### Live Monitoring
- Route: `/[lng]/trading/live`
- Purpose: real-time equity, open sessions, latency/error signals placeholder.

## Component Breakdown

### Common
- `PageHeader`: title + subtitle + actions area.
- `FiltersBar`: unified filters for symbol, strategy, date range.
- `KpiCard`: KPI tiles.
- `ChartCard`: chart wrapper.
- `LoadingState`, `ErrorState`, `EmptyState`: UX states.

### Charts
- `LineSeriesChart`: line charts (equity, drawdown, overlays).
- `BarSeriesChart`: bar charts (bot vs market, trade distribution).

### Page Components
- `ExecutiveOverviewPage`
- `SessionsPage`
- `SessionDetailPage`
- `TradesPage`
- `ComparisonPage`
- `LiveMonitoringPage`

## API Mapping

### Executive Overview
- `GET /api/analytics/overview`
- `GET /api/analytics/performance`
- `GET /api/analytics/risk`
- `GET /api/analytics/market-comparison`
- `GET /api/suggestions/global`

### Sessions
- `GET /api/sessions`
- `GET /api/sessions/compare?ids=...`

### Session Detail
- `GET /api/sessions/:id`
- `GET /api/sessions/:id/orders`
- `GET /api/suggestions/session/:id`

### Trades
- `GET /api/trades`

### Comparison
- `GET /api/sessions/compare?ids=...`

### Live Monitoring
- `GET /api/sessions/active`
- `GET /api/analytics/performance`
- `GET /api/analytics/risk`

## Loading & Error States
- All pages display `LoadingState` while fetching.
- Errors show `ErrorState` with retry action where applicable.
- Empty datasets show `EmptyState`.

## Authenticated API Client
- All API calls use `authRequest` (JWT + HMAC) via `src/lib/api/tradingDashboardApi.ts`.
