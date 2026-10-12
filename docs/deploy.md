# Despliegue

El código vive en GitHub. El sitio y el cron viven en Vercel Hobby.

Variables en Vercel, con los nombres de `.env.example`:

- `APP_PASSWORD` o `AUTH_SECRET` para la sesión.
- `DATABASE_URL` con la cadena de Postgres de Supabase. Sin ella, Vercel no conserva las ofertas.
- `RESEND_API_KEY` y `NOTIFY_EMAIL` para el resumen diario. El remitente es `onboarding@resend.dev` y solo llega al correo de la cuenta de Resend hasta verificar un dominio.
- `CRON_SECRET`. El cron de `vercel.json` llama a `/api/cron/fetch` a las 06:00 UTC.

En Supabase: un proyecto gratis, altas públicas cerradas, una cuenta creada a mano, RLS activo en las tablas. La app entra con la URL de Postgres. El PDF del CV se sustituye editando el texto en Perfil; el bucket privado queda para cuando estén las claves de Storage.

En local, sin `DATABASE_URL`, los datos van a `.data/store.json`.
