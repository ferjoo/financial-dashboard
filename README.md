# Financial Dashboard — interactive demo

**Live demo: https://ferjoo.github.io/financial-dashboard/**

A front-end demo of the financial reporting platform I built as Interim CTO / Lead Developer at Novago for a betting-shop operator in Guatemala. With it, finance and management went from waiting a full month for their reports to having them by mid-month.

> **Every number, bet shop, cashier, affiliate and user in this demo is invented.** The data comes from a seeded generator in `src/mock/`, not from any real transactions.

## What you can try

- **Financial dashboard**: totals across weekly reports (bets, deposits, withdrawals, payouts, GGR/NGR), bar charts by cashier and bet shop, and per-shop drill-down.
- **Report detail**: one week at a time, by cashier or by bet shop, with top-10 tables and CSV export.
- **Affiliate dashboard**: registrations, first-time deposits (FTD) and earnings per affiliate, sortable.
- **Playground**: compare two date ranges side by side, plus an hourly activity heatmap used to spot off-hours activity (one sample week contains a planted 2–3 a.m. session).
- **Role-based access**: switch between the five roles from the sidebar ("View as") and watch pages and actions appear or disappear.
- **Uploads**: the flow works, but files never leave the browser; an extra week of sample data is generated instead.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · TanStack Query · React Router 7 · Recharts · Axios · Zod / React Hook Form

## How the demo works

The production frontend talks to a NestJS API. Here, Axios is configured with a custom adapter (`src/mock/adapter.ts`) that answers the same endpoints in the browser from generated data (`src/mock/data.ts`), so the hooks and pages are the same ones the real app used. Routing uses a hash router so it works on GitHub Pages.

## The production system (not included here)

- **API**: NestJS 10 with JWT sessions, five-role RBAC and Swagger docs.
- **Storage**: MongoDB for users and sessions, Redis for processed reports.
- **Ingestion**: a Python worker (Polars, BullMQ, S3) that parses large transaction CSVs and computes the metrics.
- **Deploy**: Render (API) and Vercel (web).

## Run locally

```bash
pnpm install --frozen-lockfile
pnpm dev
```
