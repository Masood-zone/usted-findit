# USTED FindIt

A campus lost-and-found management portal for USTED (Universitas Sumber Daya). Students and staff can report misplaced belongings, browse published items, and submit ownership claims — all moderated through an admin approval workflow.

## Features

### For Users
- **Multi-step item reporting** — Report lost or found items through a guided wizard with draft persistence
- **Public search** — Browse published items with text query, type toggle (lost/found), and category filtering
- **Ownership claims** — Submit claims with proof description and optional evidence photos
- **Notifications** — In-app alerts for report status changes, new claims, and possible matches
- **Profile management** — View and request profile edits reviewed by admins

### For Administrators
- **Dashboard** — Operational metrics including total reports, pending queue, open claims, and activity logs
- **Report moderation** — Approve, reject, request changes, or soft-remove submissions with reason tracking
- **Claim review** — Inspect proof and evidence, approve with pickup location/code or reject
- **User management** — Profile inspection with report and claim history
- **Statistics** — Monthly trends, category breakdowns, and location distribution

### System Features
- Unified notification dispatch (in-app, email, SMS, push)
- Role-based access control (USER, ADMIN, SUPER_ADMIN)
- Audit logging for all admin mutations
- Cloudinary integration for image uploads

## Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Expo ~55, Expo Router, React Native 0.83, React 19.2 |
| **Language** | TypeScript ~5.9 (strict mode) |
| **Styling** | NativeWind 5.0 (Tailwind CSS 4.3 for RN) |
| **Database** | Neon PostgreSQL, Drizzle ORM 0.45 |
| **Auth** | Better Auth 1.6 with Expo adapter |
| **State** | Zustand 5, TanStack React Query 5.101 |
| **Forms** | React Hook Form 7.78 + Zod 4.4 |
| **HTTP** | Axios 1.17 |
| **Notifications** | Expo Push Notifications, Nodemailer, UelloSend SMS |
| **Images** | Cloudinary (signed uploads), Expo Image Picker |
| **Build** | EAS Build (dev/preview/production), Expo Updates |

## Project Structure

```
usted-findit/
├── app.json / eas.json           # Expo + EAS build configuration
├── drizzle.config.ts             # Drizzle Kit schema & migrations
├── tailwind.config.js            # Brand colors and theme
│
└── src/
    ├── app/                      # Expo Router file-based routes
    │   ├── (auth)/               # Auth screens (sign-in, create-account, etc.)
    │   ├── (public)/             # Splash, onboarding, welcome
    │   ├── (user)/               # Authenticated user area
    │   │   └── user/
    │   │       ├── (tabs)/       # Home, Search, Report, My Reports, Profile
    │   │       ├── report/       # Lost/Found report wizards
    │   │       ├── item/         # Item detail views
    │   │       └── claim/        # Claim submission and details
    │   ├── admin/                # Admin area (role-guarded)
    │   │   ├── index.tsx         # Dashboard with metrics
    │   │   ├── reports/          # Report moderation
    │   │   ├── claims/           # Claim review
    │   │   ├── users/            # User management
    │   │   └── statistics.tsx    # Analytics view
    │   └── api/                  # Server-side API routes
    │
    ├── components/               # UI components (user, admin, shared)
    ├── db/
    │   ├── schema/               # Auth and items database schema
    │   └── relations.ts          # Drizzle relational definitions
    │
    ├── lib/                      # Auth config, guards, Cloudinary, server logic
    ├── services/                 # API clients, queries, notifications, email, SMS
    ├── store/                    # Zustand stores (report draft, onboarding)
    ├── providers/                # App providers (Query, Notifications)
    ├── types/                    # TypeScript type definitions
    └── utils/                    # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- pnpm
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- PostgreSQL database (Neon recommended)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cdusted-findit

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration values
```

### Database Setup

```bash
# Generate migrations
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed sample data (optional)
pnpm db:seed
```

### Development

```bash
# Start Expo dev server
pnpm start

# Run on specific platform
pnpm android
pnpm ios
pnpm web

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### Building

```bash
# Development APK
eas build --profile development --platform android

# Preview APK
eas build --profile preview --platform android

# Production AAB
eas build --profile production --platform android

# Web export
pnpm export:web
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Better Auth
BETTER_AUTH_URL=your_app_url
BETTER_AUTH_SECRET=your_auth_secret

# Cloudinary (image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP (email notifications)
SMTP_HOST=your_smtp_host
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_PORT=587
SMTP_SECURE=false
SMTP_FROM=noreply@yourdomain.com

# UelloSend (SMS notifications)
UELLOSEND_API_KEY=your_api_key
UELLOSEND_SENDER_ID=your_sender_id
UELLOSEND_API_URL=https://api.uellosend.com
```

## Database Schema

Key tables:
- **user** — User accounts with roles (USER, ADMIN, SUPER_ADMIN)
- **items** — Lost/found item reports with status workflow
- **claims** — Ownership claims on items
- **itemImages** — Associated images for items
- **notifications** — In-app notification records
- **adminLogs** — Audit trail for admin actions

## License

[Add your license here]
