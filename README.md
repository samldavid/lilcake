# LilCake

LilCake is a Next.js storefront with:

- Next.js App Router
- NextAuth credentials + Google OAuth
- Prisma ORM
- Stripe and WhatsApp checkout flows
- Admin panel for catalog and orders

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Generate a secure auth secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

4. Apply the local SQLite schema:

```bash
npx prisma db push
```

5. Start the app:

```bash
npm run dev
```

## Environment variables

- `DATABASE_URL`: local SQLite for development, PostgreSQL for production.
- `NEXTAUTH_URL`: the public URL of the app.
- `NEXTAUTH_SECRET`: secret used by NextAuth sessions.
- `GOOGLE_CLIENT_ID`: Google OAuth client id.
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret.
- `STRIPE_SECRET_KEY`: Stripe server key.
- `STRIPE_PUBLISHABLE_KEY`: Stripe public key.
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: WhatsApp destination number.
- `NEXT_PUBLIC_APP_URL`: public app URL used by client flows.
- `NEXT_PUBLIC_APP_NAME`: display name.

## Google sign-in setup

The project already supports Google in `next-auth`, but it only turns on when both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` exist.

1. Open Google Cloud Console.
2. Create or reuse a project.
3. Configure the OAuth consent screen.
4. Create an OAuth Client ID of type `Web application`.
5. Add these Authorized JavaScript origins:
   - `http://localhost:3000`
   - your production domain, for example `https://lilcake.vercel.app` or your custom domain
6. Add these Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-production-domain/api/auth/callback/google`
7. Copy the generated client id and client secret into `.env.local` and Vercel environment variables.
8. Restart the local server after updating env vars.

Notes:

- The register screen includes a Google button too. On first login, NextAuth creates the customer account automatically.
- Google requires exact redirect URIs. Because of that, changing preview URLs are inconvenient for OAuth. Production should use a stable domain.

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add the same environment variables in Vercel for Production and, if needed, Preview/Development.
4. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to the production domain.
5. Trigger a new deployment.

Important production notes:

- SQLite is fine for local development, but it is not the right production database for Vercel. Orders, auth sessions, carts, and customer data should move to PostgreSQL before launch.
- The current image upload route writes files into `public/uploads/products`. That works locally, but Vercel serverless storage is not persistent. For production, move uploads to Cloudinary, S3, Vercel Blob, or another object storage service.

## PostgreSQL migration plan

The next backend milestone should be migrating Prisma from SQLite to PostgreSQL.

Suggested order:

1. Create a PostgreSQL database in Vercel Postgres, Neon, Supabase, or another managed provider.
2. Change `prisma/schema.prisma` datasource provider from `sqlite` to `postgresql`.
3. Replace `DATABASE_URL` with the PostgreSQL connection string.
4. Create a fresh Prisma migration history for PostgreSQL.
5. Move local seed data if needed.
6. Test auth, orders, cart sync, and admin flows again.

## Useful commands

```bash
npm run dev
npm run lint
npm run build
npx prisma studio
npx prisma db push
```
