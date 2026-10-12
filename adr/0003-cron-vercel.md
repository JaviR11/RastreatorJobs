# 0003 Cron de Vercel

- Estado: aceptado
- Fecha: 2026-10-12

La recogida diaria es un cron de Vercel Hobby que llama a `/api/cron/fetch` con `CRON_SECRET`. GitHub Actions solo hace CI. Si ese día la ruta ya guardó las mismas URLs, no duplica ofertas.
