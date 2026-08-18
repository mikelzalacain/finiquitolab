# MiFiniquito

Sitio estático de calculadoras laborales para España (2026):

- [Finiquito por baja voluntaria](calculadora-finiquito-baja-voluntaria-2026/)
- [Indemnización por despido objetivo](calculadora-indemnizacion-despido-objetivo-2026/)
- [Vacaciones no disfrutadas](calculadora-vacaciones-no-disfrutadas/)

El cálculo corre en el navegador. No hay backend.

## Probar en local

```bash
python3 -m http.server 4173
```

Abre http://127.0.0.1:4173/

## Tests

```bash
node test/calc.test.js
```

## Publicar (imprescindible para posicionar)

Google no ve esta carpeta hasta que esté en un dominio público.

1. Compra un dominio (ideal: `mifiniquito.es`).
2. Sube los archivos a Netlify, Cloudflare Pages o similar (arrastrar la carpeta basta).
3. Pon HTTPS y el dominio canónico.
4. En [Google Search Console](https://search.google.com/search-console) verifica el dominio y envía `https://mifiniquito.es/sitemap.xml`.
5. Busca en Google: `site:mifiniquito.es`. Cuando salgan las 3 URLs, el rastreo ha empezado.

El puesto 1 no se puede forzar. Estas páginas están hechas para competir en queries concretas (`calculadora finiquito baja voluntaria 2026`, etc.), no en `editor pdf` ni `calculadora irpf`.
