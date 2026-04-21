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

- Added a real coupon system connected to checkout and admin:
  - coupons can now be created, edited, activated, deactivated, and deleted from the admin panel
  - the checkout only sends the coupon code; all validation and discount calculation happen server-side
  - orders now persist subtotal, discount, total, and the coupon reference
  - coupon usage is reserved transactionally when a pending order is created and released if that order fails or is cancelled before payment
  - Stripe checkout now receives the approved discount from the backend, so the charged amount matches the order total
- Added dual coupon limits:
  - global usage limit across all customers
  - per-customer usage limit for the same coupon
  - a dedicated `CouponCustomerUsage` table now tracks per-user usage safely
  - the admin panel now surfaces remaining global uses and the per-customer rule separately
- Improved the admin coupon UX:
  - coupon creation/editing now opens in a dedicated modal instead of a compressed side panel
  - the form explains global vs per-customer limits more clearly
  - exhausted coupons are now marked as `Agotado`
- Improved checkout convenience:
  - shipping fields now use browser autocomplete metadata
  - customers can choose to remember shipping details in the local browser for future purchases
  - checkout pre-fills saved details and authenticated profile data when available
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
- Hardened admin, auth, and checkout/server flows:
  - admin pages and admin APIs now share centralized server-side ADMIN guards instead of repeating role checks inline
  - admin image uploads now validate real file signatures for supported formats instead of trusting only the browser MIME type
  - registration, forgot-password, reset-password, resend-verification, password-change requests, email verification, and checkout coupon previews now use rate limits to reduce brute-force and spam traffic
  - public API responses now sanitize Prisma/internal errors before sending them back to the browser, while server logs still keep the debugging detail
- Improved Stripe reliability and post-payment behavior:
  - the checkout success screen now polls the backend for a short period while the Stripe webhook finishes finalizing the order
  - the Stripe status endpoint is now tied to the signed-in order owner and can recover the order by saved `stripeSessionId` even if metadata is missing
  - webhook signature failures now return a generic invalid-signature response instead of echoing raw parser errors
- Tightened platform configuration and schema safety:
  - `next.config.ts` now sends a Content Security Policy that explicitly allows Stripe, Google Fonts, and local development websocket traffic
  - Prisma now uses real enums for `User.role`, `Order.status`, and `Order.paymentStatus` instead of free-form strings
  - the latest schema migration also adds an index on `Order.stripeSessionId` for faster webhook and checkout-status lookups
- Added real legal pages for the storefront:
  - `/privacidad` now renders the full data-processing and privacy policy with the current LilCake visual style
  - `/terminos` now renders the terms and conditions with structured sections and quick navigation
  - footer legal links now resolve to live pages instead of dead routes
  - both pages can surface a configured support email from `NEXT_PUBLIC_SUPPORT_EMAIL`, `SMTP_FROM`, or `SMTP_USER`
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
- `NEXTAUTH_SECRET`: secret used by NextAuth sessions. Use a long random value with at least 32 characters.
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
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret. Required once your Stripe webhook endpoint is registered.
- `NEXT_PUBLIC_STRIPE_ENABLED`: set to `true` only in environments where you want the Stripe checkout option to be visible.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: WhatsApp destination number.
- `NEXT_PUBLIC_APP_URL`: public app URL used by client flows.
- `NEXT_PUBLIC_APP_NAME`: display name.
- `NEXT_PUBLIC_SUPPORT_EMAIL`: public support/legal contact email shown in storefront legal pages.

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
- Auth-facing endpoints now have lightweight in-process rate limits to slow down repeated register, reset, verification, and password-change abuse attempts.

## Admin and API hardening

- Admin pages now enforce `ADMIN` access server-side from the admin layout, and admin API routes reuse centralized guards before touching business logic.
- Admin upload endpoints now validate file signatures for supported image formats instead of relying only on file extensions or browser-provided MIME types.
- Checkout, auth, order, and webhook routes now sanitize unexpected internal errors through a shared public-error helper so production responses leak less implementation detail.
- The checkout coupon preview endpoint is rate-limited per user and IP to make coupon probing harder.
- `next.config.ts` now sends a Content Security Policy that allows Stripe checkout resources while still blocking unapproved frames, objects, and third-party scripts by default.

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
8. After the customer returns to `/checkout?success=true`, the storefront polls the backend until that webhook-driven finalization resolves to `paid` or `failed`.

The webhook endpoint is:

```text
/api/webhooks/stripe
```

For local testing with the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use the webhook signing secret printed by the CLI as `STRIPE_WEBHOOK_SECRET` in local development.

The checkout status endpoint used by the return page is:

```text
/api/checkout/stripe?session_id=cs_test_...
```

It now requires the signed-in order owner and may return `pending`, `processing`, `paid`, or `failed` while the webhook catches up.

## Coupons and discount security

Coupons are now part of the real order flow rather than a frontend-only preview.

### How coupon validation works

1. The storefront sends only `couponCode`.
2. The backend reloads trusted prices from Prisma and recalculates the order subtotal.
3. Coupon validation checks:
   - active/inactive status
   - expiration date
   - minimum purchase amount
   - global usage limit (`maxUses`)
   - per-customer usage limit (`maxUsesPerUser`)
4. If valid, the backend stores the approved `discount`, `total`, and `couponId` on the pending order.
5. Stripe checkout receives a server-generated discount coupon so the Stripe total matches the approved backend total.
6. If the payment flow fails or the order is cancelled before being paid, the reserved coupon usage is released again.

### Global limit vs per-customer limit

- Global limit: the total number of times a coupon can be used across the entire store.
- Per-customer limit: the number of times the same authenticated user can use that coupon.

Example:

- `maxUses = 100`
- `maxUsesPerUser = 1`

This means up to 100 paid/pending reservations in total are allowed, but each signed-in customer can only consume that coupon once.

### Relevant coupon files

- `src/lib/coupons.ts`: secure coupon validation, usage reservation, release, and Stripe discount helper
- `src/lib/admin-coupons.ts`: admin payload validation and serialization
- `src/app/api/checkout/coupon/route.ts`: checkout-side coupon preview endpoint
- `src/app/api/admin/coupons/route.ts`
- `src/app/api/admin/coupons/[id]/route.ts`
- `src/components/admin/AdminCouponsManager.tsx`

## Checkout autofill and remembered shipping details

The checkout now supports both browser-native autocomplete and local remembering of shipping details.

- Inputs expose autocomplete hints such as:
  - `shipping name`
  - `email`
  - `shipping street-address`
  - `shipping address-level2`
  - `tel`
- Customers can opt in to saving their shipping details in the current browser.
- Saved values are stored locally and reused on future visits to `/checkout`.
- If the customer is authenticated, checkout also pre-fills available account name/email values.
- This is local-browser convenience only; the discount logic and order totals still remain fully server-controlled.

## PostgreSQL migration plan

This repo now uses Prisma over PostgreSQL with Supabase and keeps the same data model the app already consumes.

Recommended workflow:

1. Keep `DATABASE_URL` on the Supabase Transaction Pooler.
2. Keep `DIRECT_URL` on the Supabase Session Pooler for Prisma CLI workflows.
3. Run `npm run db:migrate` locally after pulling schema changes such as the `User.cartVersion` migration and the order/user enum migration.
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
