# 0002 Postgres con Drizzle en Supabase

- Estado: aceptado
- Fecha: 2026-10-12

La bandeja, las decisiones y el texto del CV viven en Postgres. Drizzle es el acceso. Sin `DATABASE_URL`, el desarrollo local usa `.data/store.json`, que no sobrevive en Vercel. Auth y Storage de Supabase cubren el acceso de una sola cuenta y el PDF; si esas claves no están, la contraseña de la app y el texto del CV siguen funcionando.
