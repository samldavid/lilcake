# Sistema de Comercio LilCake

Lanza un sistema e-commerce personalizable con storefront, panel admin, pagos, cupones y operación real en una sola base lista para producción. 🚀

LilCake no es solo una plantilla visual. Es un sistema de comercio completo y personalizable, pensado para adaptarse a distintos negocios, catálogos y flujos operativos sin reconstruir la base cada vez.

[Demo en Vivo](https://lilcake.vercel.app/) · [Versión en Inglés](./README.md) · [Guía Técnica en Español](./README.dev.es.md) · [Technical Docs](./README.dev.md)

## ¿Qué es esto?

LilCake Commerce System es una plataforma e-commerce integral creada para ayudar a marcas y negocios a vender online con una operación real detrás del escaparate.

Combina experiencia de compra para clientes con un panel administrativo funcional, gestión de pedidos, control de descuentos, correos transaccionales, reportes y validaciones backend orientadas a producción. La identidad visual puede personalizarse para distintos negocios, mientras la lógica del sistema se mantiene sólida y reutilizable.

La demo actual usa una marca de moda/streetwear, pero el producto está pensado para rebrandearse y adaptarse a muchos otros modelos de negocio.

## Funcionalidades

- 🛍️ Tienda online lista para vender con catálogo, páginas de producto, carrito, búsqueda y checkout
- 🔐 Autenticación flexible con email/contraseña y acceso con Google
- 💳 Checkout real con Stripe y validación segura desde backend
- 📦 Ciclo completo de pedidos con estados de pago, seguimiento de envío y visibilidad para el cliente
- 🎟️ Sistema avanzado de cupones con límites globales, por cliente y control administrativo
- 🧾 Exportación de ventas, pedidos y clientes en Excel y PDF
- 📬 Correos transaccionales para verificación, recuperación de cuenta, compra y envío
- 🔎 Búsqueda dinámica tanto en la tienda como en el panel administrativo
- 🧠 Seguridad backend para que precios, descuentos y totales no dependan del navegador
- ⚙️ Panel admin para gestionar productos, clientes, cupones, pedidos y operación comercial

## Demo en Vivo

Puedes explorar el sistema aquí:

👉 [https://lilcake.vercel.app/](https://lilcake.vercel.app/)

Si estás evaluando el sistema para una marca, un cliente o un desarrollo comercial a medida, empieza por el storefront público y luego entra al sandbox administrativo para ver el flujo completo.

## ⚠️ Información de la Demo

- Este despliegue público es un entorno de demostración.
- Los productos, clientes, pedidos y movimientos mostrados en la demo son datos de ejemplo.
- El objetivo es enseñar las funcionalidades, la navegación y la operación general del sistema.
- Algunas acciones pueden estar simuladas o reiniciarse como parte de la experiencia demo.
- La demo sirve para evaluar el producto, no para operar un negocio real.

## 🔒 Admin Demo

Existe un panel administrativo demo disponible en:

👉 [https://lilcake.vercel.app/admin-demo](https://lilcake.vercel.app/admin-demo)

- Muestra la experiencia del admin sin exponer el panel administrativo real.
- Está aislado de la operación productiva y no escribe sobre los datos reales del negocio.
- Las acciones de crear, editar, eliminar y exportar se simulan para enseñar el flujo completo.
- Un banner visible deja claro que ningún cambio se guarda de forma permanente.

- El admin real se mantiene protegido con control por roles, sesiones seguras, APIs de escritura protegidas, rate limits y validacion backend.

## Capturas

### Experiencia de Inicio
![Experiencia de inicio](./screenshots/home.png)

### Vista de Producto
![Vista de producto](./screenshots/producto2.png)

### Flujo de Checkout
![Flujo de checkout](./screenshots/carrito.png)

### Dashboard Administrativo
![Dashboard administrativo](./screenshots/Captura%20de%20pantalla%202026-04-22%20191149.png)

### Gestión de Pedidos
![Gestión de pedidos](./screenshots/Captura%20de%20pantalla%202026-04-22%20191221.png)

### Motor de Cupones
![Motor de cupones](./screenshots/Captura%20de%20pantalla%202026-04-22%20191238.png)

## Casos de Uso

- Marcas de moda que quieren una tienda visualmente cuidada con una operación seria detrás
- Negocios boutique que necesitan control de catálogo, checkout seguro y trazabilidad de pedidos
- Empresas que trabajan con promociones y necesitan reglas de cupones que protejan el margen
- Equipos que necesitan visibilidad sobre clientes, pedidos, envíos y exportación de datos
- Agencias o desarrolladores que buscan una base de comercio adaptable para distintos clientes
- Negocios que quieren lanzar rápido sin construir toda la arquitectura comercial desde cero

## Stack Tecnológico

- Next.js
- React
- PostgreSQL
- Supabase
- Prisma
- NextAuth
- Stripe
- Vercel

## Primeros Pasos

Mantengámoslo simple:

1. Clona el repositorio.
2. Instala dependencias con `npm install`.
3. Configura las variables de entorno.
4. Ejecuta el proyecto con `npm run dev`.

Si quieres la configuración técnica completa, notas de base de datos, despliegue y detalles productivos, revisa [README.dev.es.md](./README.dev.es.md).

## ¿Por qué este proyecto?

Muchos repositorios de e-commerce se ven bien por fuera, pero se quedan cortos cuando entra la operación real del negocio.

LilCake destaca porque ya incluye lo que normalmente se deja para “después”:

- validación backend real para checkout, descuentos y precios
- un panel admin que sí sirve para operar el negocio
- reglas de cupones pensadas para proteger ingresos, no solo para mostrar un campo promocional
- reportes exportables útiles para operación, control y seguimiento
- una base lista para producción con PostgreSQL, autenticación, correos y despliegue ya conectados

En resumen: es un sistema de comercio personalizable con storefront, operación y control de negocio en una sola base lista para crecer. ✨

## Licencia

Este repositorio es privado y actualmente no incluye una licencia open source.

Si se desea usar, personalizar o comercializar el sistema para un negocio, las condiciones de licencia e implementación deben definirse por separado.
