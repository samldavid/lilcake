# LilCake security notes

## App-level rate limits

The application enforces these per-IP limits in `src/proxy.ts` before route
handlers run:

- Global non-static traffic: 180 requests per minute.
- API traffic, excluding payment webhooks: 90 requests per minute.
- Write traffic (`POST`, `PUT`, `PATCH`, `DELETE`), excluding payment webhooks:
  40 requests per minute.
- Auth `POST` traffic under `/api/auth/`: 20 requests per 10 minutes.

When a limit is exceeded, the app returns `429` with `Retry-After`,
`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, and
`X-RateLimit-Policy`.

Static assets under `/_next/*`, public files with extensions, `favicon.ico`,
`robots.txt`, and `sitemap.xml` are excluded so normal page rendering does not
burn request budget on JS, CSS, images, or icons.

## Vercel Firewall production rules

Keep the app-level limits, but also configure Vercel Firewall for production so
traffic is throttled globally before it reaches the app:

- Enable Bot Protection in challenge mode.
- Rate limit all paths by IP: 180 requests per 60 seconds, action `deny` or
  `challenge`.
- Rate limit `/api/` by IP: 90 requests per 60 seconds, action `deny`.
- Rate limit `POST /api/auth/*` by IP: 20 requests per 10 minutes, action
  `deny` or `challenge`.
- Keep payment webhook endpoints signed and monitored; do not disable signature
  verification to make rate limiting easier.

The in-app limiter is defense in depth. On a multi-instance or multi-region
deployment, Vercel Firewall or a durable shared store should be the source of
truth for globally consistent throttling.

## Checkout and coupon hardening

- Coupon usage is now tracked as a temporary reservation until payment is
  confirmed. Reservations expire after 30 minutes and each customer can hold at
  most three pending reservations for the same coupon.
- Cancelled or failed unpaid orders release only active, unconsumed coupon
  reservations. Paid orders keep the coupon marked as consumed.
- Late successful payments for already-cancelled orders are marked as paid for
  financial visibility, but the app does not re-confirm the order, decrement
  stock, consume coupons again, or send a normal order-confirmation email.
- Stripe and Wompi status endpoints validate the authenticated user's local
  order/payment record before calling the external provider, preventing users
  from forcing provider lookups with arbitrary IDs.
- Wompi webhooks now require a fresh signed timestamp and store processed event
  fingerprints in `WebhookEvent` so exact signed replays are ignored.
- Public demo PDF/XLSX exports have a tighter endpoint-specific rate limit to
  reduce CPU abuse in the public sandbox.

## Secret handling

- Keep `.env*` files local only. They are ignored by Git and excluded from
  Vercel uploads.
- `NEXTAUTH_SECRET` must be a strong random value in every non-local
  environment. Rotating it invalidates existing sessions, which is expected.
