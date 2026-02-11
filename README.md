# EasyGameTopUp - Authentication Flow

This project now includes a production-style authentication flow using Next.js API routes, HTTP-only cookies, short-lived JWT access tokens, refresh token rotation, middleware-based protection, and Google sign-in.

## Security Practices Implemented

- `HTTP-only cookies` for access and refresh tokens (prevents JavaScript token theft).
- `Secure + SameSite=Lax` cookies (mitigates CSRF in modern browser flows).
- `Server-side verification` in middleware and API handlers (prevents client tampering).
- `Short-lived access token` (15 minutes) + refresh rotation (7 days).
- `Refresh token hashing` in DB (`AuthSession.tokenHash`) for safer storage.

## What Is Included

### Auth Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Protected Middleware

- Root `middleware.ts` protects `/api/purchase/*`.
- Middleware verifies `egt_access` JWT server-side.
- On success, middleware forwards identity in internal headers:
  - `x-auth-user-id`
  - `x-auth-user-email`
  - `x-auth-user-role`

### Domain API Routes

- `GET /api/game` (public)
- `GET /api/product` (public, supports `?gameId=`)
- `GET /api/purchase` (protected)
- `POST /api/purchase` (protected)

## Environment Variables

Use these in `.env` and production secrets manager:

- `DATABASE_URL`
- `JWT_SECRET` (recommended, at least 32 chars)
- `SECRET_KEY` (fallback only)
- `APP_NAME`
- `GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (required for Google button in login/register pages)

Notes:
- `JWT_SECRET` is preferred over `SECRET_KEY`.
- In production (`NODE_ENV=production`), cookies are automatically `Secure`.
- If secrets were exposed in development or commits, rotate them immediately.

## Prisma Changes

### `User` additions

- `name String?`
- `avatarUrl String?`
- `passwordHash String?`
- `googleId String? @unique`
- `emailVerified Boolean @default(false)`

### New model

- `AuthSession`
  - stores hashed refresh token (`tokenHash`)
  - supports expiry and revocation
  - linked to `User` with cascade delete

Migration file:
- `prisma/migrations/20260211160000_auth_flow/migration.sql`

## How To Run

1. Generate Prisma client:
```bash
npx prisma generate
```

2. Apply DB migrations:
```bash
npx prisma migrate dev
```

3. Start app:
```bash
npm run dev
```

## API Usage Examples

### Register

```bash
curl -i -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPass123","name":"Demo User"}'
```

### Login

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPass123"}'
```

### Google Auth

From frontend Google Identity Services, send the ID token:

```bash
curl -i -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"<google-id-token>"}'
```

### Refresh Session

```bash
curl -i -X POST http://localhost:3000/api/auth/refresh
```

### Current User

```bash
curl -i http://localhost:3000/api/auth/me
```

### Logout

```bash
curl -i -X POST http://localhost:3000/api/auth/logout
```

## Access User in Server Components

Use cookie-based server helper:

```ts
// app/dashboard/page.tsx
import { getCurrentUserFromCookies } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await getCurrentUserFromCookies();

  if (!user) {
    return <div>Please log in.</div>;
  }

  return <div>Welcome, {user.name ?? user.email}</div>;
}
```

## Access User in Client Components

Client components should call `/api/auth/me` (never read HTTP-only cookies directly):

```tsx
"use client";

import { useEffect, useState } from "react";

type MeResponse = {
  authenticated: boolean;
  user: { id: string; email: string; role: string; name: string | null } | null;
};

export function UserBadge() {
  const [data, setData] = useState<MeResponse | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData({ authenticated: false, user: null }));
  }, []);

  if (!data) return <div>Loading...</div>;
  if (!data.authenticated || !data.user) return <div>Guest</div>;

  return <div>{data.user.name ?? data.user.email}</div>;
}
```

## Testing Checklist

1. Manual register/login/logout flow creates/clears cookies.
2. Protected `/api/purchase` returns `401` when unauthenticated.
3. Authenticated `/api/purchase` returns user-specific data.
4. Refresh endpoint rotates refresh token and renews access token.
5. Google sign-in creates or updates users by email.
6. `npm run lint` passes.
7. `npm run build` passes.

## Important Do/Do Not

Do:
- Keep tokens in HTTP-only cookies.
- Verify identity only on server (middleware + handlers).
- Keep access tokens short-lived.

Do not:
- Store tokens in `localStorage`.
- Trust client-only auth checks.
- Expose secrets in frontend code.
- Use long-lived tokens without refresh rotation.
