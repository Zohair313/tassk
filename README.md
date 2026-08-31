# DHMS — Domain & Hosting Management System

A production-grade **full-stack** web application for managing domains, hosting subscriptions, dashboards, and support queries. Built with **Next.js (Frontend)**, **Express.js (Backend)**, and **Supabase (PostgreSQL + Auth + RLS)**.

## Live Links

> Replace these with your actual deployed URLs after deploying.

- **Frontend (Vercel):** [`https://your-app.vercel.app`](https://your-app.vercel.app)
- **Backend API (Render):** [`https://your-api.onrender.com`](https://your-api.onrender.com)

## Demo Test Accounts

These accounts are pre-loaded and confirmed (login works immediately).

| Role  | Email | Password |
| ----- | ----- | -------- |
| User  | `demo.user@dhms.com` | `DemoUser123!` |
| Admin | `demo.admin@dhms.com` | `DemoAdmin123!` |

## Repo Structure

```
task/
├── backend/    # Node.js + Express REST API (Render)
│   ├── routes/ # auth, domains, hosting, dashboard, contact
│   ├── config/ # supabase clients
│   ├── middleware/auth.js
│   └── .env.example
├── frontend/   # Next.js App Router + Tailwind (Vercel)
│   └── .env.example
└── postman/    # Exported Postman collection (DHMS.postman_collection.json)
```

## Technology Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Framer Motion, Recharts, lucide-react
- **Backend:** Node.js, Express.js (RESTful API)
- **Database/Auth:** Supabase (PostgreSQL) with Row-Level Security policies and Supabase Auth
- **Deployment:** Vercel (frontend), Render (backend), Supabase Cloud (DB)

## Features

- **Auth & RBAC** — register, login, protected routes, session persistence (JWT via Supabase), two roles: `user` and `admin`
- **Domain Management (CRUD)** — add, edit, delete, search domains; fields: Domain Name, Registrar, Purchase Date, Expiry Date, dynamic status (`Active` / `Expiring Soon` / `Expired`)
- **DevOps Domain Console** — live status + days-remaining, one-click **DNS health check** (A/AAAA records, nameservers, latency)
- **Hosting Plans & Subscriptions** — Starter / Business / Enterprise tiers; attach a plan to any registered domain; next-billing auto-calculation
- **Subscription Console** — server IP, SSH, cPanel, region, and live resource usage bars (storage/bandwidth/CPU/RAM)
- **User Dashboard** — summary counts, expiration warnings, active hosting specs
- **Admin Panel** — global system metrics, growth chart, **user directory**, **plan management** (create/edit/activate/delete), **support query resolution** (open/closed)
- **Contact & Support** — contact form writes to DB; admin tracks and resolves queries

## Setup Instructions

### Backend (local / Render)

1. `cd backend && npm install`
2. Copy `.env.example` to `.env` and fill in your Supabase values.
3. Run locally: `node index.js` → server on `http://localhost:5000`

**Render deployment:**
- Root directory: `backend`
- Build: `npm install`
- Start: `node index.js`
- Env vars: `PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`

### Frontend (local / Vercel)

1. `cd frontend && npm install`
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL`.
3. Run locally: `npm run dev` → app on `http://localhost:3000`

**Vercel deployment:**
- Root directory: `frontend`
- Env var: `NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api`

### Database Note

The `domains` table supports an optional `purchase_date` (`date`) column. If you want Purchase Date captured on add/edit, add that column to your `domains` table in Supabase:

```sql
ALTER TABLE domains ADD COLUMN IF NOT EXISTS purchase_date date;
```

The API handles the column gracefully whether or not it exists.

## API Endpoints

Base URL: `https://your-api.onrender.com/api` (local: `http://localhost:5000/api`)

### Auth
| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/auth/register` | Register a new user (role forced to `user`) |
| POST | `/auth/login` | Login, returns JWT + user |
| GET | `/auth/me` | Get current user |

### Domains
| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/domains` | List my domains (admin: all) |
| POST | `/domains` | Create a domain |
| GET | `/domains/check?name=` | DNS health check (A/AAAA/NS, latency) |
| PUT | `/domains/:id` | Update a domain |
| DELETE | `/domains/:id` | Delete a domain |

### Hosting
| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/hosting/plans` | List active plans |
| POST | `/hosting/subscribe` | Subscribe a domain to a plan |
| GET | `/hosting/subscriptions` | List my subscriptions |
| POST | `/hosting/plans` | **Admin** — create plan |
| PUT | `/hosting/plans/:id` | **Admin** — update/toggle plan |
| DELETE | `/hosting/plans/:id` | **Admin** — delete plan |

### Dashboard
| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/dashboard/user` | User stats (domains, expiring, subs) |
| GET | `/dashboard/admin` | **Admin** — global metrics |
| GET | `/dashboard/admin/users` | **Admin** — user directory |

### Contact & Support
| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/contact` | Submit a contact query |
| GET | `/contact` | **Admin** — list messages |
| PUT | `/contact/:id` | **Admin** — set status (`open`/`closed`) |

## Postman Collection

An exported Postman collection is included at [`postman/DHMS.postman_collection.json`](postman/DHMS.postman_collection.json). Import it into Postman, set the `baseUrl` collection variable to your API URL, and run Login (User) and Login (Admin) first — their test scripts automatically store the bearer tokens used by authenticated requests.
