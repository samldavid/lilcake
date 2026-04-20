# LilCake

LilCake es una tienda construida con Next.js que incluye:

- Next.js App Router
- NextAuth con credenciales y Google OAuth
- Prisma ORM
- Flujos de checkout con Stripe y WhatsApp
- Panel administrativo para catalogo y pedidos

[Read this README in English](./README.md)

## Cambios recientes

- Prisma se migro de SQLite a PostgreSQL con una configuracion lista para Supabase.
- El repositorio ahora incluye historial de migraciones de Prisma, `prisma.config.ts` y scripts de base de datos para generar cliente, migrar, desplegar migraciones, poblar datos y abrir Studio.
- Las instalaciones de dependencias ahora regeneran el cliente de Prisma automaticamente mediante `postinstall`, lo que ayuda a evitar builds rotos de `@prisma/client` despues de reinstalar paquetes.
- La persistencia del carrito ahora usa versionado por usuario, lo que reduce sobrescrituras locales viejas cuando la misma cuenta pasa por flujos de invitado, login y regreso desde checkout.
- Las confirmaciones de pago con Stripe ahora cierran la orden en un solo punto: el stock se descuenta dentro de una transaccion, las ordenes pagadas pasan a confirmadas y el carrito del usuario autenticado se limpia al completarse el pago.
- La migracion mas reciente agrega `User.cartVersion`, asi que cualquier entorno que baje estos cambios debe correr la migracion pendiente de Prisma antes de probar sincronizacion del carrito o flujos post-pago.
- Las consultas de productos y categorias del storefront se movieron a helpers cacheados con `unstable_cache`, y las mutaciones de productos ahora disparan `revalidatePath()` de forma selectiva.
- Varias paginas del storefront y del admin ahora usan consultas Prisma con `select` mas acotado junto con nuevos indices para reducir payloads y mejorar busquedas de listados y detalles.
- Los headers de seguridad ahora se definen en `next.config.ts`, mientras que `src/proxy.ts` queda enfocado en proteger rutas `/admin` y `/api/admin`.
- Stripe ahora puede quedar desactivado por entorno: el checkout cae a WhatsApp, las rutas de Stripe inicializan el SDK de forma lazy y los endpoints de pago responden `503` hasta que Stripe se configure.
- Cuando Stripe esta habilitado, las sesiones de checkout ahora normalizan las URLs de imagenes del producto y el formato de montos antes de enviar los line items a Stripe.
- El checkout con Stripe ahora crea primero una orden pendiente, envia metadata segura en la Checkout Session y termina la compra con un webhook verificado en backend, sin confiar solo en la confirmacion del cliente.
- La seguridad de cuenta ahora incluye reglas mas fuertes para contrasenas, confirmacion de contrasena, formularios compatibles con gestores de contrasenas, creacion/cambio de contrasena desde la cuenta, verificacion de correo y recuperacion de acceso.
- Las solicitudes no autorizadas a `/admin` y `/api/admin` ahora se reescriben como respuestas tipo `not-found`, para que el area administrativa quede menos expuesta a usuarios no administradores.
- La guia de despliegue ahora refleja la configuracion actual con PostgreSQL/Supabase y documenta la limitacion de almacenamiento no persistente para uploads locales en Vercel.

## Configuracion local

1. Instala las dependencias:

```bash
npm install
```

Ahora `npm install` ejecuta `prisma generate` automaticamente. Si el cliente de Prisma vuelve a quedar desactualizado despues de reinstalar dependencias, deten el servidor dev y corre `npm run db:generate` una vez.

2. Copia la plantilla de variables de entorno:

```bash
cp .env.example .env
```

3. Genera un secreto seguro para autenticacion:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

4. Crea o aplica la migracion de Prisma:

```bash
npm run db:migrate
```

5. Ejecuta el seed de la base de datos:

```bash
npm run db:seed
```

6. Inicia la aplicacion:

```bash
npm run dev
```

## Variables de entorno

- `DATABASE_URL`: cadena de conexion PostgreSQL usada por la aplicacion en runtime.
- `DIRECT_URL`: cadena de conexion PostgreSQL directa usada por los comandos CLI de Prisma.
- `NEXTAUTH_URL`: URL publica de la aplicacion.
- `NEXTAUTH_SECRET`: secreto usado por las sesiones de NextAuth.
- `GOOGLE_CLIENT_ID`: client id de Google OAuth.
- `GOOGLE_CLIENT_SECRET`: client secret de Google OAuth.
- `SMTP_HOST`: host SMTP usado para enviar correos de verificacion y recuperacion.
- `SMTP_PORT`: puerto SMTP.
- `SMTP_SECURE`: usa `true` para transportes TLS implicitos como el puerto 465; en otros casos `false`.
- `SMTP_USER`: usuario SMTP si tu proveedor exige autenticacion.
- `SMTP_PASS`: clave SMTP si tu proveedor exige autenticacion.
- `SMTP_FROM`: remitente visible de los correos de verificacion y restablecimiento.
- `STRIPE_SECRET_KEY`: llave privada de Stripe.
- `STRIPE_PUBLISHABLE_KEY`: llave publica de Stripe.
- `STRIPE_WEBHOOK_SECRET`: secreto del webhook de Stripe.
- `NEXT_PUBLIC_STRIPE_ENABLED`: define `true` solo en los entornos donde quieras mostrar la opcion de checkout con Stripe.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: numero de destino de WhatsApp.
- `NEXT_PUBLIC_APP_URL`: URL publica usada por flujos del cliente.
- `NEXT_PUBLIC_APP_NAME`: nombre visible de la app.

## Configuracion de inicio de sesion con Google

El proyecto ya soporta Google en `next-auth`, pero solo se activa cuando existen `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.

1. Abre Google Cloud Console.
2. Crea o reutiliza un proyecto.
3. Configura la pantalla de consentimiento OAuth.
4. Crea un OAuth Client ID de tipo `Web application`.
5. Agrega estos Authorized JavaScript origins:
   - `http://localhost:3000`
   - tu dominio de produccion, por ejemplo `https://lilcake.vercel.app` o tu dominio personalizado
6. Agrega estos Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-production-domain/api/auth/callback/google`
7. Copia el client id y el client secret generados en `.env` y en las variables de entorno de Vercel.
8. Reinicia el servidor local despues de actualizar las variables.

Notas:

- La pantalla de registro tambien incluye un boton de Google. En el primer inicio de sesion, NextAuth crea la cuenta del cliente automaticamente.
- El acceso con Google ahora marca el correo como verificado automaticamente.
- Google exige redirect URIs exactas. Por eso, las preview URLs cambiantes son incomodas para OAuth. Produccion deberia usar un dominio estable.

## Seguridad de cuenta y correos

- El registro con correo ahora exige minimo 6 caracteres y al menos una mayuscula, una minuscula, un numero y un simbolo.
- Tanto el registro como el restablecimiento de contrasena ahora piden confirmar la clave.
- Los usuarios autenticados pueden crear o cambiar su contrasena desde `/cuenta`.
- El registro envia un enlace de verificacion de correo, y desde la cuenta se puede reenviar si hace falta.
- La recuperacion de contrasena esta disponible en `/recuperar-contrasena` con un token de un solo uso que vence en una hora.
- Si faltan las variables SMTP, la app sigue funcionando en local y deja el enlace de verificacion o recuperacion en la consola del servidor en vez de enviar un correo real.
- Antes de produccion, configura un proveedor SMTP real en Vercel para que esos correos se entreguen de verdad.

## Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en Vercel.
3. Agrega las mismas variables de entorno en Vercel para Production y, si hace falta, Preview/Development.
4. Define `NEXTAUTH_URL` y `NEXT_PUBLIC_APP_URL` con el dominio de produccion.
5. Lanza un nuevo deployment.

Notas importantes de conexion:

- En muchas redes locales con IPv4, el host directo de Supabase (`db.<project-ref>.supabase.co`) no resuelve.
- Para este repo, usa el Supavisor Transaction Pooler (`:6543` con `?pgbouncer=true`) en `DATABASE_URL` y el Session Pooler (`:5432`) en `DIRECT_URL`.
- Si tu entorno soporta IPv6 o despues compras el add-on IPv4 de Supabase, `DIRECT_URL` puede apuntar al host directo.
- Para Vercel/serverless mas adelante, manten `DATABASE_URL` en el Transaction Pooler. Opcionalmente puedes agregar `connection_limit=1` si ves presion de conexiones en serverless.
- Si Stripe todavia no forma parte de ese entorno, manten `NEXT_PUBLIC_STRIPE_ENABLED=false` y deja desactivados los pagos hasta retomar ese rollout.
- La ruta actual de subida de imagenes escribe archivos en `public/uploads/products`. Eso funciona localmente, pero el almacenamiento serverless de Vercel no es persistente. En produccion deberias mover uploads a Cloudinary, S3, Vercel Blob u otro object storage.

## Flujo de ordenes y webhook de Stripe

El flujo de checkout ahora funciona asi:

1. El cliente envia el checkout desde el storefront.
2. El backend vuelve a cargar productos y variantes desde Prisma, valida stock y precio, y crea una `Order` pendiente con sus `OrderItem` antes de redirigir a Stripe.
3. La Checkout Session de Stripe incluye metadata segura como `orderId`, `orderNumber` y `userId`.
4. Stripe llama a `POST /api/webhooks/stripe`.
5. El webhook verifica la cabecera `stripe-signature` con `STRIPE_WEBHOOK_SECRET`.
6. Cuando llega `checkout.session.completed` o `checkout.session.async_payment_succeeded`, la orden se finaliza una sola vez: el pago pasa a `PAID`, la orden pasa a confirmada, el stock se descuenta dentro de una transaccion y el carrito del usuario se limpia del lado del servidor.
7. Cuando llega `checkout.session.async_payment_failed` o `checkout.session.expired`, la orden se marca como fallida sin confiar en el frontend.

El endpoint del webhook es:

```text
/api/webhooks/stripe
```

Para probarlo localmente con Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Usa como `STRIPE_WEBHOOK_SECRET` el secreto de firma que imprime la CLI en local.

## Plan de migracion PostgreSQL

Este repo ahora usa Prisma sobre PostgreSQL con Supabase y mantiene el mismo modelo de datos que ya consume la aplicacion.

Flujo recomendado:

1. Mantener `DATABASE_URL` en el Supabase Transaction Pooler.
2. Mantener `DIRECT_URL` en el Supabase Session Pooler para flujos CLI de Prisma.
3. Ejecutar `npm run db:migrate` localmente despues de bajar cambios de esquema como la migracion de `User.cartVersion`.
4. Usar `npm run db:migrate` mientras desarrollas nuevos cambios de esquema.
5. Usar `npm run db:seed` para repoblar datos locales/dev desde cero.
6. Al desplegar luego en Vercel, mantener `DATABASE_URL` en el transaction pooler y ejecutar `npm run db:deploy`.

## Comandos utiles

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
