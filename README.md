# DHMS — Domain & Hosting Management System

A **frontend-only** web application for managing domains, hosting subscriptions, dashboards, and support queries. Built with **Next.js (App Router) + React + Tailwind CSS**. All data is served from a simulated local data layer (hardcoded seed data + `localStorage` persistence) — **no backend / database / API keys required**.

## Live Link

- **Frontend (Vercel):** [`https://frontend-eta-vert-58.vercel.app/`](https://frontend-eta-vert-58.vercel.app/)

## Demo Test Accounts

These accounts are pre-loaded and work immediately (credentials are checked locally).

| Role  | Email | Password |
| ----- | ----- | -------- |
| User  | `demo.user@dhms.com` | `DemoUser123!` |
| Admin | `demo.admin@dhms.com` | `DemoAdmin123!` |

## Repo Structure

```
tassk/
├── frontend/          # Next.js App Router + Tailwind (Vercel)
│   ├── src/
│   │   ├── app/       # pages (login, register, dashboard, admin, contact, faq)
│   │   ├── components/# ChatBot, etc.
│   │   └── lib/       # local data layer (mock API — src/lib/api.ts)
│   └── .env.example
└── README.md
```

## Technology Stack

- **Next.js** (App Router), **React**, **Tailwind CSS**
- **Framer Motion**, **Recharts**, **lucide-react**
- **react-hot-toast**

> The former Express/Supabase backend has been removed. `src/lib/api.ts` is a drop-in client data layer that answers the same endpoints from in-browser seed data + `localStorage` (no network requests). The DNS health-check is simulated. The chatbot is fully client-side (hardcoded Q&A).

## Features

- **Auth & RBAC** — register / login (local), protected dashboard routes, two roles: `user` and `admin`
- **Domain Management (CRUD)** — add, edit, delete, search domains; fields: Domain Name, Registrar, Purchase Date, Expiry Date, dynamic status (`Active` / `Expiring Soon` / `Expired`)
- **DevOps Domain Console** — live status + days-remaining, one-click DNS health check (simulated A/AAAA records, nameservers, latency)
- **Hosting Plans & Subscriptions** — Starter / Business / Enterprise tiers; attach a plan to any registered domain; next-billing auto-calculation
- **Subscription Console** — server IP, SSH, cPanel, region, and live resource usage bars (storage/bandwidth/CPU/RAM)
- **User Dashboard** — summary counts, expiration warnings, active hosting specs
- **Admin Panel** — global metrics, growth chart, **user directory**, **plan management** (create/edit/activate/delete), **support query resolution** (open/closed)
- **Contact & Support** — contact form; admin tracks and resolves queries
- **Chatbot** — client-side Q&A knowledge base

## Setup Instructions (local)

1. `cd frontend`
2. `npm install`
3. `npm run dev` → app on `http://localhost:3000` (no env vars required)

No `.env` file is needed — the app runs entirely in the browser. A `.env.example` is provided for reference only.

## Vercel Deployment

- Import the repo and set **Root Directory** to `frontend`
- Default build command `npm run build` + start `npm start`
- No environment variables required.

## Data / Persistence

Seeded data (domains, plans, users, subscriptions, messages) is created on first load and stored in `localStorage` under `dhms_*` keys. Changes you make (add/edit/delete domains, subscribe to plans, resolve messages, register users) persist in your browser. A fresh visitor sees the same hardcoded demo seed.

## Postman Collection

The exported collection at [`postman/DHMS.postman_collection.json`](postman/DHMS.postman_collection.json) documents the API surface that the local data layer implements. Because the app is frontend-only, it is informational documentation of the endpoint contract rather than a live remote API.
