import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🎂 Seeding LilCake database...")

  // ── Create Admin User ─────────────────────
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@lilcake.co" },
    update: {},
    create: {
      name: "Admin LilCake",
      email: "admin@lilcake.co",
      password: adminPassword,
      role: "ADMIN",
      phone: "+573000000000",
    },
  })
  console.log("✅ Admin user created:", admin.email)

  // ── Create Categories ─────────────────────
  const categories = [
    { name: "Ropa", slug: "ropa", description: "Camisetas, hoodies, pantalones y más", sortOrder: 1 },
    { name: "Zapatos", slug: "zapatos", description: "Sneakers, botas y calzado urbano", sortOrder: 2 },
    { name: "Accesorios", slug: "accesorios", description: "Gorras, cadenas, bolsos y más", sortOrder: 3 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  
  const ropaCat = await prisma.category.findUnique({ where: { slug: "ropa" } })
  const zapatosCat = await prisma.category.findUnique({ where: { slug: "zapatos" } })
  const accCat = await prisma.category.findUnique({ where: { slug: "accesorios" } })

  console.log("✅ Categories created")

  // ── Create Products ─────────────────────
  if (ropaCat && zapatosCat && accCat) {
    const products = [
      {
        slug: "sweater-supreme-new-york",
        name: "Sweater Supreme New York",
        description: "Classic knitted thick sweater con parche frontal en contraste. Ideal para clima urbano frío.",
        price: 320000,
        compareAtPrice: 350000,
        categoryId: ropaCat.id,
        isFeatured: true,
        img: "/images/ropa.png",
        variants: [
          { size: "S", color: "Beige", stock: 10, sku: "SUP-NY-S-BEJ" },
          { size: "M", color: "Beige", stock: 15, sku: "SUP-NY-M-BEJ" },
        ]
      },
      {
        slug: "sneakers-jordan-1-mid-black-white",
        name: "Jordan 1 Mid Black White",
        description: "Silueta clásica con bloques de color blanco panda y negro. Perfectos para el street style diario.",
        price: 650000,
        compareAtPrice: null,
        categoryId: zapatosCat.id,
        isFeatured: true,
        img: "/images/zapatos.png",
        variants: [
          { size: "8 (US)", color: "Black/White", stock: 4, sku: "JD1-M-8-BW" },
          { size: "9 (US)", color: "Black/White", stock: 6, sku: "JD1-M-9-BW" },
        ]
      },
      {
        slug: "coleccion-gorras-volcom",
        name: "Colección Gorras Volcom + Accesorios",
        description: "Pack exclusivo de headwear urbano Volcom.",
        price: 90000,
        compareAtPrice: 110000,
        categoryId: accCat.id,
        isFeatured: true,
        img: "/images/accesorios.png",
        variants: [
          { size: "Unitalla", color: "Varios", stock: 20, sku: "VOLC-ACC-P" }
        ]
      }
    ]

    for (const prod of products) {
      await prisma.product.upsert({
        where: { slug: prod.slug },
        update: {},
        create: {
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          price: prod.price,
          compareAtPrice: prod.compareAtPrice,
          categoryId: prod.categoryId,
          isFeatured: prod.isFeatured,
          images: {
            create: [{ url: prod.img, sortOrder: 0 }]
          },
          variants: {
            create: prod.variants.map(v => ({
              size: v.size,
              color: v.color,
              stock: v.stock,
              sku: v.sku
            }))
          }
        }
      })
    }
    console.log("✅ Promotional products created")
  }

  // ── Create Sample Coupon ──────────────────
  await prisma.coupon.upsert({
    where: { code: "BIENVENIDO" },
    update: {},
    create: {
      code: "BIENVENIDO",
      type: "PERCENTAGE",
      value: 10,
      minPurchase: 50000,
      maxUses: 100,
      isActive: true,
    },
  })
  console.log("✅ Sample coupon created: BIENVENIDO (10% off)")

  console.log("🎉 Seed complete!")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
