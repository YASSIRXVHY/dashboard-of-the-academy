# Abyssal Academy - Management Dashboard

A comprehensive management platform for the Abyssal Academy English & French online academy. Manage teachers, student groups, track payments, and export data.

## Features

- **Admin Authentication** — Secure login with token-based session management
- **Teacher Management** — Add, edit, and manage teachers for English and French courses
- **Group Management** — Create unlimited groups, assign teachers, and manage students
- **Payment Tracking** — Track monthly payments with age-based pricing:
  - Students aged 18+ → **250 DH/month**
  - Students under 18 → **200 DH/month**
- **Data Export** — Export payment and group data as CSV files
- **Dashboard Analytics** — Visual charts and statistics for your academy

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** SQLite + Prisma ORM
- **UI:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts

## Quick Start

### Prerequisites

- **Node.js** v18+ installed
- **npm** (comes with Node.js)

### Setup Instructions

1. **Extract the zip** to your preferred folder

2. **Open a terminal** in the project folder

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

5. **Create the database:**
   ```bash
   npx prisma db push
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

7. **Open your browser** and go to: **http://localhost:3000**

### Login Credentials

| Field    | Value       |
|----------|-------------|
| Username | `yassir`    |
| Password | `xvhy20015` |

> **Note:** The admin account is automatically created on your first login attempt. No additional setup needed.

## Optional: Seed the Database

If you want to pre-create the admin user before running the app:

```bash
npx tsx seed.ts
```

## Project Structure

```
abyssal-academy/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── dev.db              # SQLite database (auto-created)
├── public/
│   ├── logo.png            # Academy logo
│   ├── brandmark.png       # Brand mark
│   └── logo.svg            # SVG logo
├── src/
│   ├── app/
│   │   ├── page.tsx         # Main entry (login/dashboard router)
│   │   ├── layout.tsx       # Root layout
│   │   ├── globals.css      # Global styles
│   │   └── api/             # API routes
│   ├── components/          # UI components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── login-page.tsx
│   │   ├── dashboard-page.tsx
│   │   ├── groups-page.tsx
│   │   ├── payments-page.tsx
│   │   ├── teachers-page.tsx
│   │   └── app-layout.tsx
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utilities & configs
├── seed.ts                  # Database seeder
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Troubleshooting

### "Prisma Client not generated"
Run `npx prisma generate` to generate the Prisma client.

### "Database not found"
Run `npx prisma db push` to create the database.

### "Module not found" errors
Delete `node_modules` and `package-lock.json`, then run `npm install` again.

### Port 3000 already in use
Kill the process using port 3000 or use a different port:
```bash
npx next dev -p 3001
```
