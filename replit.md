# Meow Meow Pet Shop — POS System

A full-featured Point of Sale and inventory management system for Meow Meow Pet Shop.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Radix UI, TanStack Query
- **Backend**: Express (Node.js), TypeScript
- **Database**: MongoDB (via Mongoose)
- **Auth**: Express session + bcrypt (username/password)

## Getting Started

Dependencies install automatically after import. The app starts via the **Start application** workflow which runs both backend and frontend together.

Default login: **admin / admin123**

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `SESSION_SECRET` | Secret for signing session cookies (optional, has default) |

## Development

```bash
# Install deps
pnpm install

# Start everything (backend on 8080, frontend on 5000)
PORT=8080 pnpm run dev:server &
PORT=5000 BASE_PATH=/ pnpm run dev:client
```

## User Preferences

- Keep monorepo structure: client/, server/, shared/
- MongoDB for all primary data storage
- Numeric IDs with Counter collection for auto-increment
