# LilCake

LilCake is a Next.js storefront with:

- Next.js App Router
- NextAuth credentials + Google OAuth
- Prisma ORM
- Stripe and WhatsApp checkout flows
- Admin panel for catalog and orders

[Leer este README en espanol](./README.es.md)

## Recent updates

- Prisma was migrated from SQLite to PostgreSQL with Supabase-ready connection guidance.
- The repo now includes Prisma migration history, `prisma.config.ts`, and database scripts for generate, migrate, deploy, seed, and studio workflows.
- Dependency installs now regenerate the Prisma client automatically through `postinstall`, which helps avoid stale `@prisma/client` builds after reinstalling packages.
- Cart persistence is now versioned per user, which reduces stale local overwrites when the same account moves between guest, authenticated, and return-from-checkout flows.
- Paid Stripe confirmations now finalize the order in one place: stock is decremented transactionally, paid orders move to confirmed status, and the authenticated user's cart is cleared after successful payment.
- The latest migration adds `User.cartVersion`, so environments that pull these changes should run the pending Prisma migration before testing cart sync or post-payment flows.
- Storefront product/category queries were extracted into cached data helpers with `unstable_cache`, while product mutations now trigger selective `revalidatePath()` calls.
- Several storefront and admin pages now use narrower Prisma `select` queries plus new database indexes to reduce payload size and improve list/detail lookups.
- Security headers now come from `next.config.ts`, while `src/proxy.ts` stays focused on protecting `/admin` and `/api/admin` routes.
- Stripe can now stay disabled per environment: checkout falls back to WhatsApp, Stripe routes lazily initialize the SDK, and payment endpoints return `503` until Stripe is configured.
- When Stripe is enabled, checkout sessions now normalize product image URLs and amount formatting before sending line items to Stripe.
- Stripe checkout now persists a pending order before redirecting, includes secure metadata in the Checkout Session, and completes the purchase through a verified webhook instead of trusting client-side confirmation alone.
- Account security now includes stronger password rules, password confirmation, password-manager-friendly auth forms, password creation/change from the account page, email verification links, and password reset flows.
- Unauthorized `/admin` and `/api/admin` requests are now rewritten to not-found style responses so the admin area stays less discoverable to non-admin visitors.
- The deployment guide now reflects the current PostgreSQL/Supabase setup and documents the non-persistent local upload limitation on Vercel.

## Local setup

1. Install dependencies:

```bash
npm install
```

`npm install` now runs `prisma generate` automatically. If the Prisma client ever goes stale after reinstalling dependencies, stop the dev server and run `npm run db:generate` once.

2. Copy the environment template:

```bash
cp .env.example .env
```

3. Generate a secure auth secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

4. Create/apply the Prisma migration:

```bash
npm run db:migrate
```

5. Seed the database:

```bash
npm run db:seed
```

6. Start the app:

```bash
npm run dev
```

## Environment variables

- `DATABASE_URL`: PostgreSQL connection string used by the app runtime.
- `DIRECT_URL`: direct PostgreSQL connection string used by Prisma CLI commands.
- `NEXTAUTH_URL`: the public URL of the app.
- `NEXTAUTH_SECRET`: secret used by NextAuth sessions.
- `GOOGLE_CLIENT_ID`: Google OAuth client id.
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret.
- `SMTP_HOST`: SMTP host used to send verification and password reset emails.
- `SMTP_PORT`: SMTP port.
- `SMTP_SECURE`: `true` for implicit TLS transports such as port 465, otherwise `false`.
- `SMTP_USER`: SMTP username if your provider requires authentication.
- `SMTP_PASS`: SMTP password if your provider requires authentication.
- `SMTP_FROM`: sender shown in verification and password reset emails.
- `STRIPE_SECRET_KEY`: Stripe server key.
- `STRIPE_PUBLISHABLE_KEY`: Stripe public key.
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret.
- `NEXT_PUBLIC_STRIPE_ENABLED`: set to `true` only in environments where you want the Stripe checkout option to be visible.
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
7. Copy the generated client id and client secret into `.env` and Vercel environment variables.
8. Restart the local server after updating env vars.

Notes:

- The register screen includes a Google button too. On first login, NextAuth creates the customer account automatically.
- Google sign-in now marks the account email as verified automatically.
- Google requires exact redirect URIs. Because of that, changing preview URLs are inconvenient for OAuth. Production should use a stable domain.

## Account security and email flows

- Credential sign-up now enforces a minimum of 6 characters plus uppercase, lowercase, number, and symbol requirements.
- Sign-up and password reset both require password confirmation.
- Signed-in users can create or change their password from `/cuenta`.
- Registration now sends an email verification link, and authenticated users can resend that link from the account page if needed.
- Password reset is available from `/recuperar-contrasena`, with a one-time token that expires after one hour.
- If SMTP variables are missing, the app keeps working in local development and prints the verification/reset link in the server console instead of sending a real email.
- Before production, configure a real SMTP provider in Vercel so verification and recovery emails are actually delivered.

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add the same environment variables in Vercel for Production and, if needed, Preview/Development.
4. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to the production domain.
5. Trigger a new deployment.

Important connection notes:

- On many local IPv4 networks, the Supabase direct host (`db.<project-ref>.supabase.co`) will not resolve.
- For this repo, use the Supavisor Transaction Pooler (`:6543` with `?pgbouncer=true`) in `DATABASE_URL` and the Session Pooler (`:5432`) in `DIRECT_URL`.
- If your environment supports IPv6 or you buy the Supabase IPv4 add-on later, `DIRECT_URL` can point to the direct host instead.
- For Vercel/serverless later, keep `DATABASE_URL` on the Transaction Pooler. You can optionally append `connection_limit=1` if you hit connection pressure in serverless.
- If Stripe is not part of the current environment yet, keep `NEXT_PUBLIC_STRIPE_ENABLED=false` and leave Stripe payments disabled until the payment rollout resumes.
- The current image upload route writes files into `public/uploads/products`. That works locally, but Vercel serverless storage is not persistent. For production, move uploads to Cloudinary, S3, Vercel Blob, or another object storage service.

## Orders and Stripe webhook flow

The checkout flow now works like this:

1. The customer submits checkout from the storefront.
2. The backend reloads product and variant data from Prisma, validates stock and price, and creates a pending `Order` plus `OrderItem` records before redirecting to Stripe.
3. The Stripe Checkout Session includes secure metadata such as `orderId`, `orderNumber`, and `userId`.
4. Stripe calls `POST /api/webhooks/stripe`.
5. The webhook verifies the `stripe-signature` header with `STRIPE_WEBHOOK_SECRET`.
6. On `checkout.session.completed` or `checkout.session.async_payment_succeeded`, the order is finalized exactly once: payment moves to `PAID`, the order moves to confirmed, stock is decremented transactionally, and the user cart is cleared server-side.
7. On `checkout.session.async_payment_failed` or `checkout.session.expired`, the order is marked as failed without trusting the frontend.

The webhook endpoint is:

```text
/api/webhooks/stripe
```

For local testing with the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use the webhook signing secret printed by the CLI as `STRIPE_WEBHOOK_SECRET` in local development.

## PostgreSQL migration plan

This repo now uses Prisma over PostgreSQL with Supabase and keeps the same data model the app already consumes.

Recommended workflow:

1. Keep `DATABASE_URL` on the Supabase Transaction Pooler.
2. Keep `DIRECT_URL` on the Supabase Session Pooler for Prisma CLI workflows.
3. Run `npm run db:migrate` locally after pulling schema changes such as the `User.cartVersion` migration.
4. Use `npm run db:migrate` while developing new schema changes.
5. Use `npm run db:seed` to repopulate local/dev data from scratch.
6. When deploying to Vercel later, keep `DATABASE_URL` on the transaction pooler and run `npm run db:deploy`.

## Useful commands

```bash
npm run dev
npm run lint
npm run build
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:push
npm run db:seed
npm run db:studio
```
