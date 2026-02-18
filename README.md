# Dorota - Task & Wins Tracker

A minimal web app for daily task management with a kanban-style workflow per day, calendar views, and important task tracking.

## Quick Start

```bash
# Ensure PostgreSQL is running (Docker)
docker start dorota-postgres || docker run -d --name dorota-postgres \
  -e POSTGRES_USER=dorota -e POSTGRES_PASSWORD=dorota_secret_2026 \
  -e POSTGRES_DB=dorota -p 5432:5432 --restart unless-stopped postgres:16-alpine

# Install and run
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

App runs at `http://localhost:3000`. Register with the `REGISTRATION_SECRET` from `.env`.

## Architecture

- **Framework**: Next.js 16 (App Router, TypeScript, Tailwind CSS 4)
- **Database**: PostgreSQL 16 via Docker, Prisma 7 ORM with PrismaPg adapter
- **Auth**: JWT in httpOnly cookie, bcrypt passwords, secret-key gated registration
- **DnD**: @dnd-kit for drag-and-drop between task categories

## Features

- **Day view**: 3-column kanban (Todo / In Progress / Done) + General checklist sidebar
- **Calendar**: Day, Week, Month, Year zoom levels with navigation
- **Task forwarding**: Incomplete TODO/IN_PROGRESS tasks auto-forward to today
- **Important tasks**: Star tasks as important, view wins summary by period
- **General list**: All-time checklist visible on every day
- **Auth**: Login/Register with admin-provided registration key

## Environment Variables (.env)

```
DATABASE_URL="postgresql://dorota:dorota_secret_2026@localhost:5432/dorota"
JWT_SECRET="change-me-in-prod"
REGISTRATION_SECRET="key-you-give-to-users"
```

## Automations

Scripts in `.ariana/automations/`:
- `on-ready.sh` - Start DB + dev server + clean memory (on_agent_ready)
- `on-before-commit.sh` - Type check + tests + lint (on_before_commit)
- `production.sh` - Build and run production (manual trigger)

Register with: `bash .ariana/setup-automations.sh` (requires valid ariana CLI token)
