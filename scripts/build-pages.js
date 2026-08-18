const fs = require("fs");
const path = require("path");

const NAV = `
      <nav>
        <a href="/">Todas</a>
        <a href="/calculadora-finiquito-2026/">Finiquito</a>
        <a href="/calculadora-sueldo-neto-2026/">Sueldo neto</a>
        <a href="/calculadora-paro-2026/">Paro</a>
        <a href="/calculadora-cuota-autonomos-2026/">Autónomos</a>
      </nav>`;

function related(current) {
  const all = [
    ["/calculadora-finiquito-2026/", "Finiquito 2026"],
    ["/calculadora-finiquito-baja-voluntaria-2026/", "Baja voluntaria"],
    ["/calculadora-indemnizacion-despido-objetivo-2026/", "Despido objetivo"],
    ["/calculadora-indemnizacion-despido-improcedente-2026/", "Despido improcedente"],
    ["/calculadora-fin-contrato-temporal-2026/", "Contrato temporal"],
    ["/comparativa-despido-objetivo-improcedente/", "20 vs 33 días"],
    ["/calculadora-vacaciones-no-disfrutadas/", "Vacaciones"],
    ["/calculadora-sueldo-neto-2026/", "Bruto a neto"],
    ["/calculadora-paro-2026/", "Paro SEPE"],
    ["/calculadora-preaviso-despido/", "Preaviso"],
    ["/calculadora-horas-extra-2026/", "Horas extra"],
    ["/calculadora-cuota-autonomos-2026/", "Autónomos"],
  ];
  const items = all
    .filter(([href]) => href !== current)
    .map(([href, t]) => `<li><a href="${href}">${t}</a></li>`)
    .join("");
  return `<section class="section prose"><h2>Otras calculadoras</h2><ul>${items}</ul></section>`;
}

function page(p) {
  const faqs = (p.faq || [])
    .map(
      (f) => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`
    )
    .join("\n      ");
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (p.faq || []).map((f) => ({
      "@type": "Question",
      name: f.q.replace(/<[^>]+>/g, ""),
      acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]+>/g, "") },
    })),
  };
  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: p.title,
    url: "https://mifiniquitolab.es" + p.path,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>(function(){if(location.hostname==="mikelzalacain.github.io")document.write('<base href="/finiquitolab/">');})();</script>
  <title>${p.title}</title>
  <meta name="description" content="${p.description}">
  <link rel="canonical" href="https://mifiniquitolab.es${p.path}">
  <meta name="robots" content="index,follow">
  <meta property="og:title" content="${p.h1}">
  <meta property="og:description" content="${p.description}">
  <meta property="og:url" content="https://mifiniquitolab.es${p.path}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_ES">
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/styles.css">
  <script type="application/ld+json">${JSON.stringify(faqLd)}</script>
  <script type="application/ld+json">${JSON.stringify(appLd)}</script>
</head>
<body>
  <header class="site-header">
    <div class="wrap">
      <a class="brand" href="/"><span class="brand-mark">FL</span> FiniquitoLab</a>
      ${NAV}
    </div>
  </header>
  <main class="wrap">
    <section class="hero">
      <p class="kicker">${p.kicker}</p>
      <h1>${p.h1}</h1>
      <p class="lede">${p.lede}</p>
    </section>
    <section class="grid-2" id="calculadora">
      <form class="card calc" id="form">${p.form}
        <button class="btn" type="submit">${p.button || "Calcular"}</button>
      </form>
      <div class="card result" id="out" aria-live="polite"></div>
    </section>
    <section class="section prose">${p.body}</section>
    <section class="section faq"><h2>Preguntas frecuentes</h2>
      ${faqs}
    </section>
    ${related(p.path)}
  </main>
  <footer class="site-footer">
    <div class="wrap">
      <div>Estimación orientativa. No sustituye al SEPE, Hacienda ni a un laboralista.</div>
      <div><a href="/aviso-legal.html">Aviso legal</a> · <a href="/privacidad.html">Privacidad</a></div>
    </div>
  </footer>
  <script src="/js/calc.js"></script>
  <script src="/js/ui.js"></script>
  <script>
    (function () {
      var form = document.getElementById("form");
      var out = document.getElementById("out");
      function run() { ${p.run} }
      bindForm(form, run);
      run();
    })();
  </script>
</body>
</html>
`;
}

const dates = `
        <div class="row">
          <div class="field"><label for="start">Fecha de alta</label><input id="start" type="date" value="2021-03-01" required></div>
          <div class="field"><label for="end">Fecha de cese</label><input id="end" type="date" value="2026-06-18" required></div>
        </div>`;
const salary = `
        <h2>Tus datos</h2>
        <div class="row">
          <div class="field"><label for="monthly">Salario bruto mensual (€)</label><input id="monthly" type="number" min="0" step="0.01" value="1800" required></div>
          <div class="field"><label for="pagas">Pagas al año</label>
            <select id="pagas"><option value="12">12</option><option value="14" selected>14</option><option value="15">15</option></select>
          </div>
        </div>${dates}
        <div class="row">
          <div class="field"><label for="daysWorked">Días trabajados del mes del cese</label><input id="daysWorked" type="number" min="0" max="31" value="18"></div>
          <div class="field"><label for="unusedVacation">Vacaciones pendientes</label><input id="unusedVacation" type="number" min="0" step="0.5" value="8"></div>
        </div>
        <div class="field"><label for="monthsExtras">Meses de pagas extras generados</label><input id="monthsExtras" type="number" min="0" max="12" value="6"></div>
        <label class="check field"><input id="extrasInMonthly" type="checkbox"><span>Las extras ya van prorrateadas en la nómina.</span></label>`;

const indemnRun = (fn, label) => `
        var pagas = Number(document.getElementById("pagas").value);
        var data = C.${fn}({
          monthly: document.getElementById("monthly").value,
          pagas: pagas,
          start: document.getElementById("start").value,
          end: document.getElementById("end").value,
          daysWorked: document.getElementById("daysWorked").value,
          unusedVacation: document.getElementById("unusedVacation").value,
          monthsExtras: document.getElementById("monthsExtras").value,
          extrasInMonthly: document.getElementById("extrasInMonthly").checked || pagas === 12
        });
        if (data.error) return renderError(out, data.error);
        var d = data.indemnizacionDetalle;
        out.innerHTML = '<p class="kicker">${label}</p>' +
          '<p class="total">' + C.euros(data.totalConIndemnizacion) + '</p>' +
          '<p class="muted">Indemnización ' + C.euros(data.indemnizacion) + ' + finiquito salarial ' + C.euros(data.total) + '.</p>' +
          '<ul class="breakdown">' +
          '<li><span>Antigüedad</span><span>' + d.months + ' meses (' + C.num(d.yearsFraction, 2) + ' años)</span></li>' +
          '<li><span>Salario día</span><span>' + C.euros(d.daily) + '</span></li>' +
          '<li><span>Indemnización</span><span>' + C.euros(data.indemnizacion) + (d.capped ? ' · tope' : '') + '</span></li>' +
          '<li><span>Salario pendiente</span><span>' + C.euros(data.salarioPendiente) + '</span></li>' +
          '<li><span>Vacaciones</span><span>' + C.euros(data.vacaciones) + '</span></li>' +
          '<li><span>Pagas extras</span><span>' + C.euros(data.pagasExtra) + '</span></li>' +
          '<li class="strong"><span>Total bruto</span><span>' + C.euros(data.totalConIndemnizacion) + '</span></li></ul>';`;

const pages = [
  {
    path: "/calculadora-finiquito-2026/",
    title: "Calculadora de finiquito 2026 | FiniquitoLab",
    description:
      "Calcula tu finiquito en España 2026: baja voluntaria, despido objetivo, improcedente o fin de contrato temporal. Gratis y al instante.",
    kicker: "España · 2026",
    h1: "Calculadora de finiquito 2026",
    lede: "Elige cómo termina el contrato. Verás salario pendiente, vacaciones, pagas extras y, si toca, la indemnización.",
    button: "Calcular finiquito",
    form: salary.replace(
      "<h2>Tus datos</h2>",
      `<h2>Tus datos</h2>
        <div class="field"><label for="tipo">Tipo de cese</label>
          <select id="tipo">
            <option value="baja">Baja voluntaria (sin indemnización)</option>
            <option value="objetivo" selected>Despido objetivo (20 días/año)</option>
            <option value="improcedente">Despido improcedente (33 días/año)</option>
            <option value="temporal">Fin de contrato temporal (12 días/año)</option>
          </select></div>`
    ),
    body: `<h2>Qué incluye un finiquito</h2>
      <p>El finiquito liquida lo ya generado: salario del mes, vacaciones no disfrutadas y pagas extras. La indemnización es aparte y solo entra en despido o fin de temporal.</p>
      <div class="example"><strong>Atajo.</strong> Si te vas tú, usa también la <a href="/calculadora-finiquito-baja-voluntaria-2026/">página de baja voluntaria</a>. Si te despiden, compara con la <a href="/comparativa-despido-objetivo-improcedente/">tabla 20 vs 33 días</a>.</div>`,
    faq: [
      { q: "¿Finiquito e indemnización son lo mismo?", a: "No. El finiquito se paga siempre. La indemnización solo en algunos ceses." },
      { q: "¿El finiquito tributa?", a: "El salarial sí. La indemnización legal por despido está exenta hasta el límite y 180.000 €." },
    ],
    run: `
        var tipo = document.getElementById("tipo").value;
        var pagas = Number(document.getElementById("pagas").value);
        var input = {
          monthly: document.getElementById("monthly").value,
          pagas: pagas,
          start: document.getElementById("start").value,
          end: document.getElementById("end").value,
          daysWorked: document.getElementById("daysWorked").value,
          unusedVacation: document.getElementById("unusedVacation").value,
          monthsExtras: document.getElementById("monthsExtras").value,
          extrasInMonthly: document.getElementById("extrasInMonthly").checked || pagas === 12
        };
        var data = tipo === "baja" ? C.finiquitoBajaVoluntaria(input)
          : tipo === "improcedente" ? C.despidoImprocedente(input)
          : tipo === "temporal" ? C.finContratoTemporal(input)
          : C.despidoObjetivo(input);
        if (data.error) return renderError(out, data.error);
        var total = data.totalConIndemnizacion != null ? data.totalConIndemnizacion : data.total;
        var ind = data.indemnizacion || 0;
        out.innerHTML = '<p class="kicker">Total bruto estimado</p><p class="total">' + C.euros(total) + '</p>' +
          '<ul class="breakdown">' +
          '<li><span>Salario pendiente</span><span>' + C.euros(data.salarioPendiente) + '</span></li>' +
          '<li><span>Vacaciones</span><span>' + C.euros(data.vacaciones) + '</span></li>' +
          '<li><span>Pagas extras</span><span>' + C.euros(data.pagasExtra) + '</span></li>' +
          '<li><span>Indemnización</span><span>' + C.euros(ind) + '</span></li>' +
          '<li class="strong"><span>Total</span><span>' + C.euros(total) + '</span></li></ul>';`,
  },
  {
    path: "/calculadora-indemnizacion-despido-improcedente-2026/",
    title: "Calculadora indemnización despido improcedente 2026 | FiniquitoLab",
    description:
      "Indemnización por despido improcedente en España 2026: 33 días de salario por año, tope 24 mensualidades y prorrateo por meses.",
    kicker: "Art. 56.1 ET · 33 días / año",
    h1: "Calculadora de indemnización por despido improcedente 2026",
    lede: "33 días de salario por año, máximo 24 mensualidades. Los días sueltos cuentan como un mes más.",
    form: salary,
    body: `<h2>Fórmula</h2><p>Salario día = bruto anual ÷ 365. Indemnización = salario día × 33 × años (prorrateo por meses), con tope de 24 mensualidades.</p>
      <p>Si el despido es objetivo procedente, la regla es 20 días y 12 mensualidades: <a href="/calculadora-indemnizacion-despido-objetivo-2026/">calculadora de despido objetivo</a>.</p>`,
    faq: [
      { q: "¿Cuánto es el despido improcedente en 2026?", a: "33 días por año, tope 24 mensualidades. No ha cambiado." },
      { q: "¿Y si el contrato es anterior a 2012?", a: "Puede haber un tramo de 45 días. Esta herramienta usa solo 33. Consulta a un laboralista si tu alta es anterior al 12 de febrero de 2012." },
    ],
    run: indemnRun("despidoImprocedente", "Improcedente + finiquito"),
  },
  {
    path: "/calculadora-fin-contrato-temporal-2026/",
    title: "Calculadora fin de contrato temporal 2026 | FiniquitoLab",
    description:
      "Indemnización por fin de contrato temporal en España 2026: 12 días de salario por año trabajado, más el finiquito.",
    kicker: "12 días / año",
    h1: "Calculadora de fin de contrato temporal 2026",
    lede: "Cuando acaba un temporal, además del finiquito suele haber 12 días de salario por año (art. 49.1.c ET).",
    form: salary,
    body: `<h2>12 días, no 20 ni 33</h2>
      <p>La extinción por fin de obra o de duración determinada lleva indemnización de 12 días por año, prorrateada por meses. No confundir con un despido.</p>`,
    faq: [
      { q: "¿Todos los temporales tienen 12 días?", a: "Es la regla general. Algunos formativos o de relevo pueden variar. Revisa el contrato y el convenio." },
    ],
    run: indemnRun("finContratoTemporal", "Temporal + finiquito"),
  },
  {
    path: "/comparativa-despido-objetivo-improcedente/",
    title: "Despido objetivo vs improcedente: calculadora 20 y 33 días",
    description:
      "Compara en un clic la indemnización de despido objetivo (20 días) y despido improcedente (33 días) con tus fechas y sueldo.",
    kicker: "20 vs 33 días",
    h1: "Comparativa despido objetivo vs improcedente",
    lede: "Misma antigüedad, dos reglas. Así ves cuánto cambia si el despido acaba declarado improcedente.",
    form: salary,
    button: "Comparar",
    body: `<p>El objetivo procedente es 20 días/año (tope 12 mensualidades). El improcedente, 33 días (tope 24). La diferencia suele ser el motivo para impugnar.</p>`,
    faq: [
      { q: "¿Puedo reclamar el improcedente?", a: "Tienes 20 días hábiles para demandar. Esta cifra es orientativa, no un dictamen." },
    ],
    run: `
        var pagas = Number(document.getElementById("pagas").value);
        var input = {
          monthly: document.getElementById("monthly").value, pagas: pagas,
          start: document.getElementById("start").value, end: document.getElementById("end").value,
          daysWorked: document.getElementById("daysWorked").value, unusedVacation: document.getElementById("unusedVacation").value,
          monthsExtras: document.getElementById("monthsExtras").value,
          extrasInMonthly: document.getElementById("extrasInMonthly").checked || pagas === 12
        };
        var data = C.comparativaDespido(input);
        if (data.objetivo.error) return renderError(out, data.objetivo.error);
        out.innerHTML = '<p class="kicker">Diferencia de indemnización</p><p class="total">' + C.euros(data.diferencia) + '</p>' +
          '<ul class="breakdown">' +
          '<li><span>Objetivo (20 días)</span><span>' + C.euros(data.objetivo.indemnizacion) + '</span></li>' +
          '<li><span>Improcedente (33 días)</span><span>' + C.euros(data.improcedente.indemnizacion) + '</span></li>' +
          '<li class="strong"><span>Improcedente paga de más</span><span>' + C.euros(data.diferencia) + '</span></li></ul>' +
          '<p class="note">El finiquito salarial es el mismo en ambos: ' + C.euros(data.objetivo.total) + '.</p>';`,
  },
  {
    path: "/calculadora-sueldo-neto-2026/",
    title: "Calculadora sueldo neto 2026: bruto a neto España | FiniquitoLab",
    description:
      "Pasa tu salario bruto a neto en 2026: Seguridad Social (~6,5%) e IRPF estimado por tramos. SMI 1.221 € en 14 pagas.",
    kicker: "Bruto → neto · 2026",
    h1: "Calculadora de sueldo neto 2026",
    lede: "Del bruto anual restamos cotización del trabajador e IRPF orientativo. El SMI (17.094 €) se trata como sin retención.",
    form: `
        <h2>Tu salario</h2>
        <div class="row">
          <div class="field"><label for="monthly">Bruto mensual (€)</label><input id="monthly" type="number" min="0" step="0.01" value="2000"></div>
          <div class="field"><label for="pagas">Pagas</label>
            <select id="pagas"><option value="12">12</option><option value="14" selected>14</option><option value="15">15</option></select>
          </div>
        </div>
        <label class="check field"><input id="temporal" type="checkbox"><span>Contrato temporal (desempleo 1,60% en vez de 1,55%).</span></label>`,
    body: `<h2>Qué se resta</h2>
      <p>El trabajador cotiza alrededor del <strong>6,50%</strong> (4,70% contingencias comunes + desempleo + FP + MEI 0,15% en 2026). El IRPF de esta página usa tramos estatales orientativos y un mínimo personal de 5.550 €. No reproduce el algoritmo de retenciones de la AEAT (hijos, discapacidad, CCAA).</p>
      <div class="example">SMI 2026: 1.221 € × 14 = 17.094 €/año (RD 126/2026).</div>`,
    faq: [
      { q: "¿Por qué no coincide con mi nómina?", a: "La retención real usa el modelo 145, la comunidad y las pagas. Esto es una estimación rápida." },
    ],
    run: `
        var data = C.sueldoNeto({
          monthly: document.getElementById("monthly").value,
          pagas: document.getElementById("pagas").value,
          temporal: document.getElementById("temporal").checked
        });
        out.innerHTML = '<p class="kicker">Neto por paga</p><p class="total">' + C.euros(data.netoPaga) + '</p>' +
          '<p class="muted">Neto anual ' + C.euros(data.netoAnnual) + (data.smiExempt ? ' · IRPF 0 € (SMI o inferior)' : '') + '</p>' +
          '<ul class="breakdown">' +
          '<li><span>Bruto anual</span><span>' + C.euros(data.annual) + '</span></li>' +
          '<li><span>Seguridad Social (' + C.num(data.ssRate * 100, 2) + '%)</span><span>' + C.euros(data.ssAnnual) + '</span></li>' +
          '<li><span>IRPF estimado</span><span>' + C.euros(data.irpfAnnual) + '</span></li>' +
          '<li class="strong"><span>Neto anual</span><span>' + C.euros(data.netoAnnual) + '</span></li></ul>';`,
  },
  {
    path: "/calculadora-paro-2026/",
    title: "Calculadora de paro 2026: cuánto cobras y cuánto dura | FiniquitoLab",
    description:
      "Calcula la prestación por desempleo 2026: 70% los primeros 180 días, 60% después, topes IPREM y duración según días cotizados.",
    kicker: "SEPE · 70% / 60%",
    h1: "Calculadora de paro 2026",
    lede: "Introduce tu base reguladora y los días cotizados. Aplicamos topes del IPREM 2026 (600 € + 1/6).",
    form: `
        <h2>Tus datos SEPE</h2>
        <div class="field"><label for="base">Base reguladora mensual (€)</label>
          <input id="base" type="number" min="0" step="0.01" value="1800">
          <p class="note">Media de las bases de los últimos 180 días × 30. Si no la sabes, usa el bruto mensual aproximado.</p>
        </div>
        <div class="row">
          <div class="field"><label for="daysQuoted">Días cotizados (últimos 6 años)</label><input id="daysQuoted" type="number" min="0" value="1080"></div>
          <div class="field"><label for="hijos">Hijos a cargo</label>
            <select id="hijos"><option value="0">Ninguno</option><option value="1">1</option><option value="2">2 o más</option></select>
          </div>
        </div>`,
    body: `<h2>Duración</h2>
      <p>De 360 días cotizados (4 meses de prestación) hasta 2.160 días (24 meses). Primeros 180 días al 70% de la base; el resto al 60%, siempre entre el mínimo y el máximo según hijos.</p>
      <p>Topes 2026 (IPREM 600 € + 1/6 = 700 €): mínimo 560 € sin hijos / 749 € con hijos; máximo 1.225 / 1.400 / 1.575 €.</p>`,
    faq: [
      { q: "¿Cuánto se cobra de paro en 2026?", a: "El 70% de la base los primeros seis meses y el 60% después, con topes del IPREM." },
      { q: "¿Cuánto dura?", a: "Según días cotizados, de 4 a 24 meses. El máximo son 720 días." },
    ],
    run: `
        var data = C.paro({
          base: document.getElementById("base").value,
          daysQuoted: document.getElementById("daysQuoted").value,
          hijos: document.getElementById("hijos").value
        });
        if (data.error) return renderError(out, data.error);
        out.innerHTML = '<p class="kicker">Prestación mensual (primeros 180 días)</p><p class="total">' + C.euros(data.first) + '</p>' +
          '<p class="muted">Luego ' + C.euros(data.later) + ' / mes. Duración: ' + data.durationDays + ' días (' + C.num(data.durationMonths, 0) + ' meses).</p>' +
          '<ul class="breakdown">' +
          '<li><span>70% bruto</span><span>' + C.euros(data.firstRaw) + '</span></li>' +
          '<li><span>60% bruto</span><span>' + C.euros(data.laterRaw) + '</span></li>' +
          '<li><span>Tope mín / máx</span><span>' + C.euros(data.topes.min) + ' – ' + C.euros(data.topes.max) + '</span></li>' +
          '<li class="strong"><span>Total estimado del periodo</span><span>' + C.euros(data.total) + '</span></li></ul>';`,
  },
  {
    path: "/calculadora-preaviso-despido/",
    title: "Calculadora de preaviso de despido | 15 días | FiniquitoLab",
    description:
      "Calcula el pago de preaviso si la empresa no te avisa con 15 días en un despido objetivo.",
    kicker: "15 días",
    h1: "Calculadora de preaviso de despido",
    lede: "En despido objetivo la empresa debe preavisar 15 días o pagarlos. Aquí sale el importe.",
    form: `
        <h2>Datos</h2>
        <div class="row">
          <div class="field"><label for="monthly">Bruto mensual (€)</label><input id="monthly" type="number" value="1800"></div>
          <div class="field"><label for="days">Días de preaviso no cumplidos</label><input id="days" type="number" min="0" max="15" value="15"></div>
        </div>`,
    body: `<p>El salario día para este pago suele ser mensual ÷ 30. Si no te preavisaron nada, reclama 15 días además del <a href="/calculadora-indemnizacion-despido-objetivo-2026/">finiquito y la indemnización</a>.</p>`,
    faq: [{ q: "¿La baja voluntaria también?", a: "El convenio puede pedirte 15 días a ti. Si no preavisas, la empresa a veces descuenta esos días del finiquito." }],
    run: `
        var data = C.preaviso({ monthly: document.getElementById("monthly").value, days: document.getElementById("days").value });
        out.innerHTML = '<p class="kicker">Importe del preaviso</p><p class="total">' + C.euros(data.amount) + '</p>' +
          '<p class="muted">' + data.days + ' días × ' + C.euros(data.daily) + '</p>';`,
  },
  {
    path: "/calculadora-horas-extra-2026/",
    title: "Calculadora de horas extra 2026 | FiniquitoLab",
    description:
      "Calcula el valor de las horas extraordinarias: salario hora y recargo (por defecto 175%, según convenio).",
    kicker: "Art. 35 ET",
    h1: "Calculadora de horas extra 2026",
    lede: "El Estatuto no fija un recargo concreto; muchos convenios pagan la extra al 175% de la hora ordinaria.",
    form: `
        <h2>Datos</h2>
        <div class="row">
          <div class="field"><label for="monthly">Bruto mensual (€)</label><input id="monthly" type="number" value="1600"></div>
          <div class="field"><label for="pagas">Pagas</label><select id="pagas"><option value="12">12</option><option value="14" selected>14</option></select></div>
        </div>
        <div class="row">
          <div class="field"><label for="hours">Horas extra a cobrar</label><input id="hours" type="number" min="0" step="0.5" value="10"></div>
          <div class="field"><label for="multiplier">Recargo (1,75 = 175%)</label><input id="multiplier" type="number" min="1" step="0.05" value="1.75"></div>
        </div>
        <div class="field"><label for="yearlyHours">Horas anuales del contrato</label><input id="yearlyHours" type="number" value="1826"></div>`,
    body: `<p>Hora ordinaria = bruto anual ÷ horas anuales (1.826 es una jornada común). Extra = hora × recargo del convenio. Máximo legal: 80 extra al año, salvo fuerza mayor.</p>`,
    faq: [{ q: "¿Las extra entran en el finiquito?", a: "Si las trabajaste y no las cobraste, sí. Súmalas a mano al resultado de la calculadora de finiquito." }],
    run: `
        var data = C.horasExtra({
          monthly: document.getElementById("monthly").value, pagas: document.getElementById("pagas").value,
          hours: document.getElementById("hours").value, multiplier: document.getElementById("multiplier").value,
          yearlyHours: document.getElementById("yearlyHours").value
        });
        out.innerHTML = '<p class="kicker">Importe de las extra</p><p class="total">' + C.euros(data.amount) + '</p>' +
          '<ul class="breakdown"><li><span>Hora ordinaria</span><span>' + C.euros(data.hourly) + '</span></li>' +
          '<li><span>Hora extra</span><span>' + C.euros(data.extraHour) + '</span></li></ul>';`,
  },
  {
    path: "/calculadora-cuota-autonomos-2026/",
    title: "Calculadora cuota de autónomos 2026 | tramos RETA | FiniquitoLab",
    description:
      "Cuota de autónomos 2026 según rendimientos netos: tramos oficiales, base mínima y tipo aproximado 31,4%.",
    kicker: "RETA · Orden PJC/297/2026",
    h1: "Calculadora de cuota de autónomos 2026",
    lede: "Pon tu rendimiento neto mensual. Usamos la base mínima del tramo y un tipo del 31,4% (contingencias + IT + cese + MEI, orientativo).",
    form: `
        <h2>Rendimiento</h2>
        <div class="field"><label for="netMonthly">Rendimiento neto mensual (€)</label><input id="netMonthly" type="number" min="0" step="1" value="1500"></div>
        <div class="field"><label for="base">Base de cotización (€) — déjalo vacío para la mínima del tramo</label><input id="base" type="number" min="0" step="0.01" placeholder="Mínima del tramo"></div>`,
    body: `<p>Tablas de la Orden PJC/297/2026. Base máxima general 5.101,20 €. La tarifa plana y las bonificaciones no están en esta versión.</p>
      <p>Si facturas por cuenta ajena a la vez, mira también el <a href="/calculadora-sueldo-neto-2026/">sueldo neto</a>.</p>`,
    faq: [
      { q: "¿Cuánto paga un autónomo en 2026?", a: "Depende del tramo de ingresos. En la base mínima de cada tramo, la cuota ronda el 31,4% de esa base." },
    ],
    run: `
        var data = C.cuotaAutonomos({
          netMonthly: document.getElementById("netMonthly").value,
          base: document.getElementById("base").value
        });
        out.innerHTML = '<p class="kicker">Cuota mensual estimada</p><p class="total">' + C.euros(data.cuota) + '</p>' +
          '<p class="muted">' + data.tramo.label + '</p>' +
          '<ul class="breakdown">' +
          '<li><span>Base usada</span><span>' + C.euros(data.base) + '</span></li>' +
          '<li><span>Base mín / máx del tramo</span><span>' + C.euros(data.tramo.minBase) + ' – ' + C.euros(data.tramo.maxBase) + '</span></li>' +
          '<li><span>Tipo aplicado</span><span>' + C.num(data.tipo * 100, 1) + '%</span></li>' +
          '<li class="strong"><span>Cuota anual</span><span>' + C.euros(data.anual) + '</span></li></ul>';`,
  },
];

for (const p of pages) {
  const dir = path.join("/agent", p.path.replace(/^\//, "").replace(/\/$/, ""));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), page(p));
  console.log("wrote", p.path);
}
