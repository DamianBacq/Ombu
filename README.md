# Ombú — página modelo (estudio de estética + tienda online)

Página de demostración del emprendimiento: una marca **ficticia** ("Ombú, estudio de piel") con todo lo que se le puede vender a un cliente:

- **Sitio público:** inicio con portada animada, tratamientos, reserva de turnos online en 4 pasos (tratamiento, día y horario con profesional, datos, seña), tienda con filtros y búsqueda, detalle de producto, carrito lateral, checkout con envío o retiro, seguimiento del pedido, estado del turno con cancelación, formulario de contacto, horarios y mapa.
- **Pagos:** Mercado Pago Checkout Pro + webhook. Sin token cargado funciona en **modo demo** (una pantalla simula el pago aprobado o rechazado).
- **Panel del dueño** (`/panel`): resumen con ingresos del mes, gráfico de los últimos 30 días (tienda y estudio), más vendidos y stock bajo; pedidos con su estado (pagado, preparando, enviado, entregado); agenda semanal con cobrar / no vino / cancelar; ABM de productos; precios y duración de tratamientos; consultas del formulario.
- **Datos de ejemplo:** 12 productos, 7 tratamientos, 3 profesionales y 60 días de pedidos y turnos para que el panel se vea con movimiento.

Usuario del panel: **admin** / **ombu2026**.

## Stack

El estándar del emprendimiento: ASP.NET Core Web API (.NET 10) en capas (Entidades, Datos con Npgsql y SQL a mano, Negocio, Server), React + TypeScript con Vite, PostgreSQL, JWT con BCrypt, Mercado Pago. CSS propio (sin Bootstrap ni Tailwind).

## Cómo levantarlo (Visual Studio 2026)

1. **Base de datos:** en pgAdmin, crear la base `ombu` y correr entero el script `BaseDeDatos/ombu.sql` (crea las tablas y carga los datos de ejemplo; se puede volver a correr para resetear todo).
2. **Contraseña de PostgreSQL:** en `Ombu.Server/appsettings.json` la cadena usa `Password=postgres`. Si la tuya es otra, cargala en los secretos (clic derecho en Ombu.Server > Administrar secretos de usuario):
   ```json
   { "ConnectionStrings": { "Ombu": "Host=localhost;Port=5432;Database=ombu;Username=postgres;Password=TU_CLAVE" } }
   ```
3. **Paquetes del frontend:** en una terminal dentro de `ombu.client`, correr `npm install` (Visual Studio suele hacerlo solo al abrir la solución).
4. Abrir `Ombu.sln`, dejar **Ombu.Server** como proyecto de inicio y apretar F5. Arranca la API en `http://localhost:5080` y Vite en `http://localhost:5173` (se abre solo). Si React carga antes que la API, refrescar con F5 en el navegador.

Sin Visual Studio: `dotnet run --project Ombu.Server` en una terminal y `npm run dev` dentro de `ombu.client` en otra, y entrar a `http://localhost:5173`.

## Mercado Pago real

Cargar en los secretos `MercadoPago:AccessToken` (credenciales de prueba o producción). `MercadoPago:UrlBase` es la dirección pública del sitio (para volver del pago) y `MercadoPago:UrlNotificacion` la del webhook (`https://dominio/api/Pagos/webhook`). Con el token vacío vuelve al modo demo.

## Producción

El `Dockerfile` compila el frontend y lo sirve desde el mismo servidor .NET (una sola app, puerto 8080). Variables de entorno con `__` en lugar de `:` (por ejemplo `ConnectionStrings__Ombu`, `Jwt__Clave`, `Admin__Password`, `MercadoPago__AccessToken`).

## Reglas de negocio

- Turnos de 1 hora, de lunes a viernes de 9 a 19 y sábados de 10 a 14 (tabla `horario_atencion`). Cada profesional atiende los tratamientos de su tipo (facial o corporal). Se reserva hasta 21 días antes.
- Seña del 30% con Mercado Pago; el horario se guarda 15 minutos mientras se paga. El cliente cancela desde su link hasta 24 horas antes.
- Pedidos: el stock se descuenta al crear el pedido y se devuelve si no se paga en 30 minutos o si se cancela desde el panel. Envío $4.500, gratis desde $60.000; retiro en el estudio sin costo.
- Los precios siempre se toman de la base, nunca de lo que manda el navegador. El pago se verifica siempre consultando a Mercado Pago.
- Fechas en hora de Argentina (`Ajustes.Ahora()`), sin zona horaria en la base.

## Fotos

Las fotos son de Unsplash (licencia libre) y están en `ombu.client/public/img`. Para un cliente real se reemplazan por las suyas.
