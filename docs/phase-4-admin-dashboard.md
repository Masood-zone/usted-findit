# Phase 4: Admin Dashboard and Operational Screens

## Goal

Build the protected administrator area for reviewing lost/found reports, approving public visibility, verifying claims, managing users, and reading operational statistics.

## Screens

- Admin dashboard
- Report management
- Report review details
- Claims management
- Claim verification details
- User management
- User profile review
- Statistics and reports

## Business Rules

- New user reports remain `PENDING` until an admin approves them.
- Public search only shows `PUBLISHED` and `CLAIMED` items.
- Report approval publishes the item.
- Report rejection, change requests, and removal require an admin note or reason.
- Removed reports are hidden instead of deleted.
- Claim approval marks the claim `APPROVED`, creates pickup details, and moves the item to `CLAIMED`.
- Resolved items must not accept new claims.
- Admin mutations are logged and related users receive notifications.

## Acceptance Criteria

- Admin routes are restricted to `ADMIN` and `SUPER_ADMIN`.
- Admin can view all reported lost/found items and inspect private verification fields.
- Admin can approve, reject, request changes, or remove reports.
- Admin can approve or reject claims.
- Dashboard and statistics reflect database records.
- Loading, empty, and error states exist for all admin screens.
