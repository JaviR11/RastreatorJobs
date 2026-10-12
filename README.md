# Bandeja

Bandeja personal de empleo IT. Recoge Tecnoempleo, LinkedIn España y las remotas de Get on Board, las puntúa contra el CV y deja decidir Aplicar, Luego o Descartar. InfoJobs entra como enlaces de búsqueda mientras el servidor reciba un captcha.

## Arranque local

```bash
npm install
npm run dev
```

Abre http://127.0.0.1:43123. Si no has definido `APP_PASSWORD`, la contraseña local es `bandeja-local`.

Sin `DATABASE_URL`, las ofertas y el CV se guardan en `.data/store.json`. Para que sobrevivan en Vercel hace falta el Postgres de Supabase. El resto de variables está en `.env.example`.

## Comandos

- `npm run dev` arranca la app.
- `npm test` ejecuta los tests de puntuación y de lectura.
- `npm run lint` y `npm run typecheck` comprueban el código.
- `npm run build` genera la versión de producción.

El despliegue está en `docs/deploy.md`.
