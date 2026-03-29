# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── houseboat/          # Goa Houseboat React+Vite website (at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package
```

## Goa Houseboat Website

A luxury houseboat booking website for Goa, India — targeting foreign tourists.

### Features

**Public Website:**
- Home page with hero, WhatsApp booking button, featured packages, activities preview
- Packages page — 3 bedroom suites with prices, inclusions, WhatsApp CTA
- Dining page — breakfast, lunch, dinner, brunch, live restaurant
- Activities page — speed boating, kayaking, sightseeing, fishing, sunset cruise, private beach
- Gallery page — photos with category filters (houseboat, food, activities)
- Blog page — guest experience posts (SEO-friendly /blog/[slug] URLs)
- About/Trail page — houseboat story and trail video embed
- WhatsApp floating button throughout

**Blog System:**
- Anonymous users: submit → email OTP verification → admin approval
- Admin users: submit → direct to pending → admin can approve
- SEO meta tags (title, description, Open Graph) per post

**Admin Panel (/admin):**
- Login with username/password (default: admin / admin123)
- Dashboard with stats and pending approvals
- Manage packages (CRUD: name, description, price, capacity, inclusions, images)
- Manage activities (CRUD)
- Manage gallery images (CRUD with categories)
- Approve/reject blog posts
- Edit site-wide settings (hero image, WhatsApp number, social links, trail video URL)

### Database Tables

- `packages` — room packages (3 bedrooms seeded)
- `activities` — water activities (6 seeded)
- `gallery` — photo gallery images
- `blog_posts` — guest blog posts (status: pending/published/rejected)
- `otp_codes` — email OTP verification codes for anonymous blog submissions
- `settings` — site-wide settings (1 row)
- `admin_users` — admin login credentials

### Admin Credentials

- Username: `admin`
- Password: `admin123`

### API Endpoints

All routes under `/api`:
- `GET/POST /packages`, `PATCH/DELETE /packages/:id`
- `GET/POST /activities`, `PATCH/DELETE /activities/:id`
- `GET/POST /gallery`, `DELETE /gallery/:id`
- `GET/POST /blog`, `GET /blog/pending`, `GET/PATCH/DELETE /blog/:id`, `POST /blog/:id/approve`, `GET /blog/slug/:slug`
- `POST /blog/send-otp`, `POST /blog/verify-otp`
- `GET/PATCH /settings`
- `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `POST /inquiry`
- `GET/POST /awards`, `PATCH/DELETE /awards/:id`
- `GET/POST /faqs`, `PATCH/DELETE /faqs/:id`
- `GET/POST /events`, `PATCH/DELETE /events/:id`
- `GET /admin/export-sql?type=postgresql|mysql` — download full DB schema + data as .sql (admin only)
- `GET/PATCH /bookings`, `DELETE /bookings/:id`
- `GET/POST /chat/sessions`, `GET/POST /chat/sessions/:token/messages`, `PATCH /chat/sessions/:token/close`

### Workflows

- `artifacts/houseboat: web` — React+Vite frontend on PORT=5173
- `artifacts/api-server: API Server` — Express API on PORT=8080 (use `PORT=8080 pnpm --filter @workspace/api-server run dev`)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Key Commands

```bash
# Run codegen after OpenAPI spec changes
pnpm --filter @workspace/api-spec run codegen

# Push database schema changes
pnpm --filter @workspace/db run push

# Build API server
pnpm --filter @workspace/api-server run build
```
