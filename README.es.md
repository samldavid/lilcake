# Sistema de Comercio LilCake

Lanza un sistema e-commerce personalizable con storefront, panel admin, pagos, cupones y operación real en una sola base lista para producción. 🚀

LilCake no es solo una plantilla visual. Es un sistema de comercio completo y personalizable, pensado para adaptarse a distintos negocios, catálogos y flujos operativos sin reconstruir la base cada vez.

[Demo en Vivo](https://lilcake.vercel.app/) · [Admin Demo](https://lilcake.vercel.app/admin-demo) · [Versión en Inglés](./README.md) · [Guía Técnica en Español](./README.dev.es.md) · [Technical Docs](./README.dev.md)

## ¿Qué es esto?

LilCake Commerce System es una plataforma e-commerce integral creada para ayudar a marcas y negocios a vender online con una operación real detrás del escaparate.

Combina experiencia de compra para clientes con un panel administrativo funcional, gestión de pedidos, control de descuentos, correos transaccionales, reportes y validaciones backend orientadas a producción. La identidad visual puede personalizarse para distintos negocios, mientras la lógica del sistema se mantiene sólida y reutilizable.

La demo actual usa una marca de moda/streetwear, pero el producto está pensado para rebrandearse y adaptarse a muchos otros modelos de negocio.

## Mira el Admin en Acción

Si quieres evaluar primero la parte operativa del sistema, entra directo al sandbox administrativo:

👉 [Abrir Admin Demo](https://lilcake.vercel.app/admin-demo)

Dentro del demo puedes explorar:

- gestión de productos y catálogo
- galerías de producto con varias imágenes, portada y controles de orden
- seguimiento de pedidos y visibilidad de clientes
- control de cupones, exportaciones y flujos operativos

### Vista Previa del Admin
![Vista previa del admin](./screenshots/Captura%20de%20pantalla%202026-04-22%20191149.png)

## Funcionalidades

- Notas de venta PDF por pedido para soporte interno, descarga desde admin/cliente y adjunto en correos
- Configuracion del negocio desde admin para personalizar datos comerciales usados en notas de venta

- Diseno de storefront orientado a retail, con hero editorial, cards de producto mas limpias, filtros de catalogo mas claros y acentos LilCake usados con mas control
- 🛍️ Tienda online lista para vender con catálogo, páginas de producto, carrito, búsqueda y checkout
- 🖼️ Almacenamiento persistente de imágenes con galerías múltiples, portada, orden personalizado y soporte de Vercel Blob
- 🔐 Autenticación flexible con email/contraseña y acceso con Google
- 💳 Checkout real con Wompi, Stripe, PSE, Nequi y opción asistida por WhatsApp para contraentrega o Addi
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

La mejor forma de evaluarlo es:

1. Recorrer el storefront en la demo pública.
2. Abrir el admin demo para revisar operación, pedidos, cupones y exportaciones.
3. Usar las capturas de abajo para entender rápido el alcance antes de navegar.

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
- Las acciones sobre imágenes también son seguras en demo, así que se puede probar el orden de galería y la portada sin tocar el catálogo real.
- Un banner visible deja claro que ningún cambio se guarda de forma permanente.

- El admin real se mantiene protegido con control por roles, sesiones seguras, APIs de escritura protegidas, rate limits y validacion backend.

## Mejoras Recientes

- A fecha de 2026-05-10, el storefront recibio una pasada de diseno comercial para que LilCake se vea mas profesional y menos como una plantilla generada, sin tocar comportamiento backend.
- El hero de inicio ahora usa una imagen mas fuerte de tienda/sneakers, y la seccion de confianza integra carrusel de productos y lookbook para que la primera vista respire mejor.
- Los acentos de color de marca vuelven a la palabra LilCake, el CTA de WhatsApp y los iconos sociales del footer sin perder la direccion retail sobria.
- Inicio, catalogo, detalle de producto, carrito, ayuda, auth, cards compartidas y navegacion ahora usan menos brillos/gradientes, radios mas sobrios, mejor jerarquia de producto y mensajes de confianza mas utiles para venta.
- A fecha de 2026-05-05, Wompi Colombia queda activo en produccion para ofrecer una experiencia de pago local con PSE, Nequi, tarjetas y otros metodos disponibles por Wompi.
- La configuracion de pagos se maneja tras bambalinas con verificacion del lado servidor, para que el cliente tenga un checkout mas cercano al mercado colombiano sin exponer credenciales del negocio.
- A fecha de 2026-05-04, los pedidos ya pueden generar notas de venta PDF como comprobante interno, descargables desde admin, cuenta cliente y admin demo.
- A fecha de 2026-05-04, el admin real ya incluye una seccion de configuracion del negocio para editar nombre comercial, identificacion, correo, telefono, direccion, ciudad, logo y texto legal de la nota de venta sin tocar variables de entorno.
- El admin demo tambien muestra esta experiencia en modo sandbox, simulando el guardado sin escribir datos reales.
- Los correos de confirmacion y envio ahora pueden adjuntar la nota de venta del pedido, dejando claro que no reemplaza factura electronica ni documento equivalente DIAN.

- A fecha de 2026-05-03, el admin real y el admin demo ya permiten reordenar galerías de imágenes por producto, para que el operador controle el orden visual que verá el cliente y no solo la portada.
- Los productos del demo ahora incluyen galerías con varias imágenes, haciendo más útil el sandbox público para evaluar una gestión real de catálogo.
- A fecha de 2026-05-03, el storefront recibió una mejora visual adicional en la experiencia de inicio, con animaciones más expresivas, una sección editorial con imagen y botones directos hacia el catálogo.
- También se corrigió la navegación por categorías para que la barra superior y los filtros laterales trabajen sincronizados, además de una pasada de textos visibles para mejorar la presentación en español.
- A fecha de 2026-04-25, el storefront, el admin real y el admin demo recibieron una pasada completa de UX responsive enfocada en telefonos y tablets.
- La navegacion, el carrito, el checkout y las vistas operativas del admin ahora se sienten mas limpias en pantallas pequenas sin romper la experiencia de escritorio.

## Capturas

### Experiencia de Inicio
![Experiencia de inicio](./screenshots/home.png)

### Vista de Producto
![Vista de producto](./screenshots/producto2.png)

### Flujo de Checkout
![Flujo de checkout](./screenshots/carrito.png)

### Gestión de Pedidos
![Gestión de pedidos](./screenshots/Captura%20de%20pantalla%202026-04-22%20191221.png)

### Motor de Cupones
![Motor de cupones](./screenshots/Captura%20de%20pantalla%202026-04-22%20191238.png)

### Dashboard Administrativo
![Dashboard administrativo](./screenshots/Captura%20de%20pantalla%202026-04-22%20191149.png)

## Casos de Uso

- Marcas de moda que quieren una tienda visualmente cuidada con una operación seria detrás
- Negocios boutique que necesitan control de catálogo, checkout seguro y trazabilidad de pedidos
- Empresas que trabajan con promociones y necesitan reglas de cupones que protejan el margen
- Equipos que necesitan visibilidad sobre clientes, pedidos, envíos y exportación de datos
- Equipos de merchandising que necesitan controlar galerías, portadas y orden visual de productos
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
- Wompi Colombia
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
- almacenamiento persistente de imágenes y galerías reordenables, separado de los archivos locales de desarrollo
- un panel admin que sí sirve para operar el negocio
- cobertura de pagos locales en Colombia con Wompi, PSE, Nequi, tarjeta y opciones asistidas de checkout
- reglas de cupones pensadas para proteger ingresos, no solo para mostrar un campo promocional
- reportes exportables útiles para operación, control y seguimiento
- una base lista para producción con PostgreSQL, autenticación, correos y despliegue ya conectados

En resumen: es un sistema de comercio personalizable con storefront, operación y control de negocio en una sola base lista para crecer. ✨

## Licencia

Este repositorio es privado y actualmente no incluye una licencia open source.

Si se desea usar, personalizar o comercializar el sistema para un negocio, las condiciones de licencia e implementación deben definirse por separado.
