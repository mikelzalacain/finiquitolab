# Publicar FiniquitoLab

El sitio está preparado para **https://finiquitolab.es**. Si compraste otro nombre, dímelo y se cambian canónicas y sitemap.

## 1. Subir la web (Cloudflare Pages, gratis)

1. Entra en [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
2. Sube **toda la carpeta** del proyecto (los HTML, `css/`, `js/`, `img/`, `sitemap.xml`, `robots.txt`).
3. Cuando termine, tendrás una URL tipo `https://algo.pages.dev`. Ábrela y comprueba que las calculadoras funcionan.

## 2. Enganchar el dominio

1. En el proyecto de Pages → **Custom domains** → añade `finiquitolab.es` y `www.finiquitolab.es`.
2. Cloudflare te dirá qué hacer:

**Si el dominio está en DonDominio (u otro) y quieres DNS en Cloudflare (recomendado):**

1. En Cloudflare, **Add a site** → `finiquitolab.es` (plan Free).
2. Cloudflare te da dos nameservers (`xxx.ns.cloudflare.com`).
3. En DonDominio → el dominio → DNS / nameservers → pega esos dos.
4. Espera de 15 minutos a unas horas. Luego en Pages el dominio queda en **Active** y HTTPS se genera solo.

No hace falta comprar el dominio otra vez en Cloudflare.

## 3. Google

1. [Search Console](https://search.google.com/search-console) → añadir propiedad **Dominio**: `finiquitolab.es`.
2. Verificación: copia el registro TXT que te da Google en Cloudflare DNS.
3. Enviar sitemap: `https://finiquitolab.es/sitemap.xml`.
4. A los pocos días: `site:finiquitolab.es` en Google.

Hasta que esto no esté en internet, no hay visitas.
