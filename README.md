# LilCake

LilCake is a Next.js storefront with:

- Next.js App Router
- NextAuth credentials + Google OAuth
- Prisma ORM
- Stripe and WhatsApp checkout flows
- Admin panel for catalog and orders

[Leer este README en espanol](./README.es.md)

## Changelog

### 2026-04-20

- Added stronger account security flows:
  - password policy now requires uppercase, lowercase, number, symbol, and confirmation
  - users can create or change passwords from the account area
  - password changes now go through verified email links and one-time tokens
- Added email verification and password reset flows:
  - verification emails
  - forgot-password flow
  - password reset page with expiring token validation
- Added branded SMTP email support and Gmail local setup guidance
- Documented the security and email setup in detail in the README files
- Added a real storefront search experience:
  - the navbar search icon now opens a lateral search panel
  - product search becomes live after 3 characters
  - the catalog page now refines results dynamically while typing
  - shared search scoring was extracted into `src/lib/product-search.ts`
- Added live admin table search for products, orders, and customers:
  - new reusable admin search input and scoring helpers
  - filtering now works instantly inside the current table data
  - empty states and result counters now react to the current query
- Improved account email UX and reliability:
  - the branded security email header now uses a stable HTML/CSS monogram instead of the original image logo, which rendered badly in some desktop email clients
  - account security messaging was cleaned up and normalized
- Fixed Google sign-in account linking:
  - new users can sign in with Google and get created correctly
  - existing users with the same email can link Google without the Prisma update error seen during sign-in
- Expanded project documentation with dated release notes for easier version tracking

### 2026-04-19

- Implemented the real Stripe order finalization flow:
  - checkout creates pending orders before redirect
  - Stripe Checkout Session now carries secure metadata
  - `/api/webhooks/stripe` verifies the signature and finalizes payment server-side
  - paid orders decrement stock transactionally and clear the authenticated cart
- Updated the order flow docs to explain webhook setup and local Stripe CLI usage

### 2026-04-18

- Migrated the project database from SQLite to PostgreSQL with Supabase-oriented configuration
- Added Prisma migration history, `prisma.config.ts`, and database scripts for generate, migrate, deploy, seed, and studio
- Added automatic Prisma client generation on dependency install through `postinstall`
- Improved cart sync:
  - cart persistence is versioned per user
  - guest/authenticated cart transitions are safer
  - stale local overwrites are reduced
- Made Stripe optional per environment:
  - checkout falls back to WhatsApp
  - Stripe SDK initialization is lazy
  - payment endpoints can stay disabled until keys exist
- Extracted storefront data queries into cached helpers with `unstable_cache`
- Reduced payload sizes and improved data access with narrower Prisma `select` queries and extra indexes
- Moved security headers into `next.config.ts` and kept `src/proxy.ts` focused on admin protection

### 2026-04-17

- Added Google sign-in support for login and registration
- Added deployment-oriented auth documentation and environment variable guidance
- Imported the initial project into Git and GitHub

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

### Current account security flow

1. A customer signs up with email/password or with Google.
2. Email/password sign-up validates the password policy and requires password confirmation.
3. After registration, the backend sends a verification email.
4. Google sign-in marks the email as verified automatically.
5. From `/cuenta`, the user can request a password change only through their verified email.
6. The account page does not expose the password form permanently anymore. Instead, it shows a `Change password` or `Create password` button.
7. Clicking that button sends a temporary one-time email link to the verified address.
8. That link opens `/restablecer-contrasena` with a secure token and lets the user define the new password there.

### Security details

- Email verification tokens and password reset/change tokens are stored hashed in the database.
- Tokens are single-use and become invalid after use.
- Password reset/change links expire after one hour.
- Email verification links expire after 24 hours.
- Password changes from the account page are blocked until the email is verified.
- The reset/change form still validates password confirmation plus the full password policy.
- The account change flow reuses the same temporary token system as forgot-password, but it can only be initiated by an authenticated user.

### Local Gmail SMTP example

For local development you can use Gmail SMTP with an app password:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-google-app-password"
SMTP_FROM="LilCake <your-gmail@gmail.com>"
```

Notes:

- Use a Google app password, not your normal Gmail password.
- In local development, links usually point to `http://localhost:3000`, so they only work from the same machine running the app.
- The branded email header now uses a lightweight HTML/CSS LilCake monogram instead of the original image logo for better desktop email compatibility.
- The same SMTP settings should be added to Vercel later if you want real delivery outside local development.

### Relevant routes

- `POST /api/auth/register`: create account and trigger verification email
- `POST /api/auth/resend-verification`: resend verification for the signed-in user
- `POST /api/auth/forgot-password`: start recovery flow from login
- `POST /api/auth/request-password-change`: start password change flow from `/cuenta`
- `POST /api/auth/reset-password`: submit the new password with the temporary token
- `GET /api/auth/verify-email`: consume the verification token and mark the email as verified

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
