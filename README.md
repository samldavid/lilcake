# LilCake Commerce System

Production-ready e-commerce infrastructure for modern brands that need more than just a pretty storefront. 🚀

LilCake is not just a store theme. It is a complete, customizable commerce system designed to be adapted to different businesses, catalogs, and operational flows without rebuilding the core from scratch.

[Live Demo](https://lilcake.vercel.app/) · [Versión en Español](./README.es.md) · [Technical Docs](./README.dev.md) · [Guía Técnica en Español](./README.dev.es.md)

## What is this?

LilCake Commerce System is a full e-commerce platform built to help brands launch, manage, and scale online sales with a real operational backbone behind the storefront.

It combines customer-facing shopping flows with an internal admin system, order management, discount controls, transactional emails, reporting, and production-oriented backend validation. The visual identity can be customized for different businesses, while the system logic stays solid and reusable.

The current demo uses a fashion/streetwear brand, but the product is meant to be re-skinned and adapted to many different business models.

## Features

- 🛍️ Storefront ready to sell with catalog, product pages, cart, search, and checkout flow
- 🔐 Flexible authentication with email/password and Google sign-in
- 💳 Real checkout experience with Stripe plus order-safe backend validation
- 📦 Complete order lifecycle with payment states, shipment tracking, and customer visibility
- 🎟️ Advanced coupon engine with global limits, per-customer limits, and admin control
- 🧾 Excel and PDF exports for sales, orders, and customer data
- 📬 Transactional emails for verification, password recovery, purchase updates, and shipping notifications
- 🔎 Dynamic search in both the storefront and the admin panel
- 🧠 Backend-first security logic so prices, discounts, and checkout totals are not trusted from the browser
- ⚙️ Admin panel to manage products, customers, coupons, orders, and business operations

## Live Demo

Explore the live system here:

👉 [https://lilcake.vercel.app/](https://lilcake.vercel.app/)

## Screenshots

### Home Experience
![Home experience](./screenshots/home.png)

### Product Detail
![Product detail](./screenshots/producto2.png)

### Checkout Flow
![Checkout flow](./screenshots/carrito.png)

### Admin Dashboard
![Admin dashboard](./screenshots/Captura%20de%20pantalla%202026-04-22%20191149.png)

### Orders Management
![Orders management](./screenshots/Captura%20de%20pantalla%202026-04-22%20191221.png)

### Coupons Engine
![Coupons engine](./screenshots/Captura%20de%20pantalla%202026-04-22%20191238.png)

## Use Cases

- Fashion brands that want a polished online store with a serious operational backend
- Boutique retailers that need catalog control, secure checkout, and order traceability
- Businesses that run promotions and need coupon rules that do not break margins
- Teams that need admin visibility over customers, orders, shipping, and exports
- Agencies or developers who want a customizable commerce base for multiple clients
- Brands that want to launch fast without starting the entire commerce architecture from zero

## Tech Stack

- Next.js
- React
- PostgreSQL
- Supabase
- Prisma
- NextAuth
- Stripe
- Vercel

## Getting Started

Keep it simple:

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Configure your environment variables.
4. Run the app with `npm run dev`.

If you want the full technical setup, database notes, deployment details, and production configuration, go to [README.dev.md](./README.dev.md).

## Why this project?

Most commerce repos look good on the surface but fall apart in the real business layer.

LilCake stands out because it already includes the parts that usually get skipped:

- real backend validation for checkout, discounts, and pricing
- an admin panel that actually helps operate the business
- coupon rules designed to protect revenue, not just display a promo field
- reporting exports that are useful for operations, accounting, and daily control
- production-oriented architecture with PostgreSQL, email flows, auth, and deployment already in place

In short: this is a customizable commerce system with storefront, operations, and business control in one product-ready base. ✨

## License

This repository is currently private and does not include an open-source license.

If you want to use, customize, or commercialize the system for a business, licensing and implementation terms should be defined separately.
