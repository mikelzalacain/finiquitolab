# Publicar FiniquitoLab

El sitio está preparado para **https://finiquitolab.es**.

## Qué puedo hacer yo y qué no

No envíes la **contraseña** de Cloudflare, DonDominio ni Gmail por el chat.

| Tarea | ¿Lo puedo hacer yo? |
|---|---|
| Subir los archivos a Cloudflare Pages | Sí, con un **token de API** (no la clave de la cuenta) |
| Cambiar nameservers en DonDominio | No: hace falta tu login del registrador |
| Verificar Search Console | No: hace falta tu Google |
| Comprar o transferir el dominio | No |

Para que suba la web: en Cloudflare, **My Profile → API Tokens → Create Token**, permisos de Pages. Account ID: en el panel, columna derecha. Pásalos como secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.

## Si lo publicas tú (10 minutos)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
2. Sube la carpeta del proyecto.
3. **Custom domains** → `finiquitolab.es`.
4. Si el `.es` está en DonDominio: en Cloudflare **Add a site**, copia los 2 nameservers y pégalos en DonDominio.
5. [Search Console](https://search.google.com/search-console): propiedad de dominio + sitemap `https://finiquitolab.es/sitemap.xml`.

