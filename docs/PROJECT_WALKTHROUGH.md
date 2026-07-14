# USTED FindIt - Project Walkthrough

## Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Solution Architecture](#solution-architecture)
4. [Technical Stack](#technical-stack)
5. [Application Features](#application-features)
6. [Database Design](#database-design)
7. [User Workflows](#user-workflows)
8. [Admin System](#admin-system)
9. [Security & Authentication](#security--authentication)
10. [Deployment & Build](#deployment--build)
11. [Project Structure](#project-structure)

---

## Project Overview

**USTED FindIt** is a campus lost-and-found management portal designed for USTED (Universitas Sumber Daya). It provides a digital platform where students and staff can report misplaced belongings, browse published items, and submit ownership claims — all moderated through an admin approval workflow.

### Key Objectives

- **Digitize** the traditional lost-and-found process
- **Streamline** item reporting and claim verification
- **Moderate** content through admin approval workflows
- **Notify** users via multiple channels (in-app, email, SMS, push)
- **Provide** operational analytics for administrators

---

## Problem Statement

### Current Challenges

1. **Manual Process**: Traditional lost-and-found relies on physical bulletin boards or reception desks, which are inefficient and easily overlooked.

2. **Lack of Organization**: Items are often poorly documented, making it difficult to match lost items with found ones.

3. **Delayed Communication**: Without automated notifications, users may miss opportunities to recover their belongings.

4. **Verification Difficulties**: Manual verification processes are prone to errors and fraudulent claims.

5. **No Analytics**: Institutions lack visibility into lost-and-found operations and trends.

### Why This Application is Needed

- **Centralized Platform**: Provides a single source of truth for all lost and found items on campus
- **Automated Workflows**: Reduces manual intervention while maintaining quality through admin moderation
- **Multi-channel Notifications**: Ensures users are informed through their preferred communication channels
- **Audit Trail**: Maintains complete records of all actions for accountability
- **Scalability**: Can handle increased volume as adoption grows

---

## Solution Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Application                       │
│                  (Expo + React Native)                       │
├─────────────────────────────────────────────────────────────┤
│                      API Layer                               │
│                 (Expo Router API Routes)                     │
├─────────────────────────────────────────────────────────────┤
│                    Service Layer                             │
│    ┌─────────────┬─────────────┬─────────────┐              │
│    │   Items     │   Claims    │   Users     │              │
│    │   Service   │   Service   │   Service   │              │
│    └─────────────┴─────────────┴─────────────┘              │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                                │
│              (Drizzle ORM + PostgreSQL)                      │
├─────────────────────────────────────────────────────────────┤
│                   External Services                          │
│    ┌─────────────┬─────────────┬─────────────┐              │
│    │ Cloudinary  │  Nodemailer │ UelloSend   │              │
│    │ (Images)    │  (Email)    │ (SMS)       │              │
│    └─────────────┴─────────────┴─────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Role-Based Access Control**: Separate interfaces for regular users and administrators
2. **Moderation First**: All reports require admin approval before publication
3. **Multi-Channel Notifications**: Unified notification system across in-app, email, SMS, and push
4. **Audit Logging**: Complete trail of all administrative actions
5. **Offline Resilience**: Draft persistence for report submissions

---

## Technical Stack

### Frontend (Mobile)

| Technology | Purpose |
|------------|---------|
| **Expo ~55** | React Native framework for cross-platform development |
| **React Native 0.83** | Mobile UI framework |
| **Expo Router** | File-based routing system |
| **NativeWind 5.0** | Tailwind CSS for React Native |
| **Zustand 5** | Lightweight state management |
| **TanStack React Query 5** | Server state management and caching |
| **React Hook Form 7** | Form handling with validation |
| **Zod 4** | Schema validation |

### Backend

| Technology | Purpose |
|------------|---------|
| **Expo Router API Routes** | Server-side API endpoints |
| **Drizzle ORM 0.45** | Type-safe database ORM |
| **Neon PostgreSQL** | Serverless PostgreSQL database |
| **Better Auth 1.6** | Authentication library |

### External Services

| Service | Purpose |
|---------|---------|
| **Cloudinary** | Image upload and management |
| **Nodemailer** | Email notifications |
| **UelloSend** | SMS notifications |
| **Expo Push Notifications** | Push notifications |

---

## Application Features

### User Features

#### 1. Multi-Step Item Reporting
- Guided wizard interface for reporting lost or found items
- Draft persistence to prevent data loss
- Image upload with Cloudinary integration
- Automatic reference number generation

#### 2. Public Search
- Browse published items with text search
- Filter by type (lost/found) and category
- Real-time search results
- Item detail views with images

#### 3. Ownership Claims
- Submit claims with proof description
- Optional evidence photo upload
- Hidden verification details for security
- Claim status tracking

#### 4. Notifications
- In-app notification center
- Email notifications for important events
- SMS notifications for critical updates
- Push notifications for real-time alerts

#### 5. Profile Management
- View and edit profile information
- Request profile updates (admin approval required)
- Account status tracking

### Admin Features

#### 1. Dashboard
- Operational metrics overview
- Total reports, pending queue, open claims
- Activity logs and recent actions

#### 2. Report Moderation
- Approve, reject, or request changes
- Soft-remove with reason tracking
- Admin notes and comments
- Bulk operations support

#### 3. Claim Review
- Inspect proof and evidence
- Approve with pickup location/code
- Reject with reason
- Claim history tracking

#### 4. User Management
- Profile inspection
- Report and claim history
- Account status management

#### 5. Statistics
- Monthly trends
- Category breakdowns
- Location distribution
- Export capabilities

---

## Database Design

### Core Tables

#### Users Table
```sql
- id: Primary key
- name: User's full name
- email: Unique email address
- phone: Contact number
- institution_id: Student/staff ID
- role: USER, ADMIN, or SUPER_ADMIN
- account_status: ACTIVE, SUSPENDED, or PENDING
- onboarding_completed: Boolean flag
```

#### Items Table
```sql
- id: Primary key
- title: Item description
- type: LOST or FOUND
- status: PENDING, PUBLISHED, CLAIMED, RESOLVED, REJECTED, REMOVED, CHANGES_REQUESTED
- category: Item category
- location: Where item was lost/found
- description: Detailed description
- reference_number: Unique identifier
- reported_by_id: Foreign key to user
```

#### Claims Table
```sql
- id: Primary key
- item_id: Foreign key to items
- claimant_id: Foreign key to user
- status: SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, CANCELLED
- proof_description: Claimant's proof
- hidden_details: Verification information
- pickup_location: Where to collect item
- pickup_code: Verification code for pickup
```

#### Notifications Table
```sql
- id: Primary key
- user_id: Foreign key to user
- type: Notification type
- title: Notification title
- message: Notification content
- read_at: When notification was read
```

### Relationships

```
Users ──┬── Reports (1:N)
        ├── Claims (1:N)
        └── Notifications (1:N)

Items ──┬── Images (1:N)
        └── Claims (1:N)
```

---

## User Workflows

### Reporting a Lost Item

```
1. User taps "Report" tab
2. Selects "Lost Item"
3. Step 1: Enter item details (title, category, description)
4. Step 2: Add images, location, date/time
5. Step 3: Add verification details (private)
6. Submits report → Status: PENDING
7. Admin reviews → Approves/Rejects
8. If approved → Status: PUBLISHED (visible in search)
```

### Claiming a Found Item

```
1. User browses search and finds matching item
2. Taps "Claim This Item"
3. Enters proof description
4. Optionally uploads evidence photo
5. Submits claim → Status: SUBMITTED
6. Admin reviews claim
7. If approved → Pickup details provided
8. User collects item with pickup code
9. Item status → CLAIMED
```

### Admin Moderation Flow

```
1. Admin logs in → Dashboard view
2. Reviews pending reports queue
3. For each report:
   - Inspects details and images
   - Approves, rejects, or requests changes
   - Adds admin notes
4. Reviews pending claims
5. Approves valid claims with pickup info
6. Monitors statistics and trends
```

---

## Admin System

### Role Hierarchy

| Role | Permissions |
|------|-------------|
| **USER** | Report items, submit claims, manage profile |
| **ADMIN** | All user permissions + moderate reports/claims, manage users |
| **SUPER_ADMIN** | All admin permissions + system configuration |

### Moderation Rules

1. **Report Approval**: All new reports start as `PENDING`
2. **Publication**: Only `PUBLISHED` items appear in public search
3. **Claim Verification**: Claims require proof review before approval
4. **Soft Removal**: Removed reports are hidden, not deleted
5. **Audit Logging**: All admin actions are logged with metadata

### Dashboard Metrics

- Total reports (by status)
- Pending approval queue
- Open claims
- Recent activity log
- Monthly trends
- Category distribution

---

## Security & Authentication

### Authentication System

- **Better Auth** library with Expo adapter
- Email/password authentication
- Session management with secure tokens
- Email verification support

### Role-Based Access Control

- Route guards for admin pages
- API middleware for authorization
- Role-based UI rendering

### Data Security

- Hidden verification details (only visible to admins)
- Private owner notes
- Secure image uploads via Cloudinary signed URLs
- Environment variables for sensitive configuration

### Audit Trail

- All admin mutations logged
- Metadata captured for each action
- Timestamp and admin ID recorded

---

## Deployment & Build

### Development Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Generate database migrations
pnpm db:generate

# Push schema to database
pnpm db:push

# Start development server
pnpm start
```

### Build Profiles

| Profile | Purpose | Output |
|---------|---------|--------|
| **development** | Development client | APK (Android) |
| **preview** | Testing and demo | APK (Android) |
| **production** | App Store release | AAB (Android) |

### CI/CD with GitHub Actions

- Automated APK builds via EAS Build
- Expo token authentication
- Artifact upload for distribution
- Support for preview and production builds

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
BETTER_AUTH_URL=https://...
BETTER_AUTH_SECRET=your-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Email
SMTP_HOST=smtp.example.com
SMTP_USER=user@example.com
SMTP_PASS=password

# SMS
UELLOSEND_API_KEY=your-key
UELLOSEND_SENDER_ID=your-id
```

---

## Project Structure

```
usted-findit/
├── app.json / eas.json           # Expo + EAS configuration
├── drizzle.config.ts             # Database configuration
├── tailwind.config.js            # Styling configuration
│
└── src/
    ├── app/                      # File-based routes
    │   ├── (auth)/               # Authentication screens
    │   ├── (public)/             # Public screens (splash, onboarding)
    │   ├── (user)/               # Authenticated user area
    │   │   └── user/
    │   │       ├── (tabs)/       # Main navigation tabs
    │   │       ├── report/       # Report wizards
    │   │       ├── item/         # Item details
    │   │       └── claim/        # Claim management
    │   ├── admin/                # Admin area
    │   │   ├── index.tsx         # Dashboard
    │   │   ├── reports/          # Report moderation
    │   │   ├── claims/           # Claim review
    │   │   ├── users/            # User management
    │   │   └── statistics.tsx    # Analytics
    │   └── api/                  # API routes
    │
    ├── components/               # Reusable UI components
    ├── db/
    │   ├── schema/               # Database schema
    │   └── relations.ts          # Table relationships
    │
    ├── lib/                      # Configuration and utilities
    ├── services/                 # Business logic and API clients
    ├── store/                    # Zustand stores
    ├── providers/                # React providers
    ├── types/                    # TypeScript types
    └── utils/                    # Helper functions
```

---

## Summary

USTED FindIt solves the real problem of managing lost-and-found items on a university campus by providing a modern, digital solution that:

1. **Centralizes** the process in one accessible platform
2. **Automates** notifications and workflows
3. **Ensures** quality through admin moderation
4. **Maintains** security with role-based access
5. **Provides** visibility through analytics and audit logs

The application leverages modern technologies (Expo, React Native, PostgreSQL) to deliver a cross-platform solution that can scale with the institution's needs while maintaining a clean, maintainable codebase.