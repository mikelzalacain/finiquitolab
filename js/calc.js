/**
 * Cálculos laborales España 2026
 * Estatuto de los Trabajadores: arts. 31, 38, 49.2, 53.1.b, 56.1
 * Prorrateo por meses (TS: los días sueltos computan como mes completo).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.MiFiniquito = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var MS_DAY = 86400000;

  function parseISODate(value) {
    if (!value) return null;
    var parts = String(value).split("-");
    if (parts.length !== 3) return null;
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return isNaN(d.getTime()) ? null : d;
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function daysInclusive(from, to) {
    var a = startOfDay(from).getTime();
    var b = startOfDay(to).getTime();
    if (b < a) return 0;
    return Math.round((b - a) / MS_DAY) + 1;
  }

  /**
   * Antigüedad en meses completos. Cualquier resto de días
   * se cuenta como un mes más (doctrina TS, prorrateo por meses).
   */
  function seniorityMonths(start, end) {
    var a = startOfDay(start);
    var b = startOfDay(end);
    if (b < a) return 0;

    var years = b.getFullYear() - a.getFullYear();
    var months = b.getMonth() - a.getMonth();
    var days = b.getDate() - a.getDate();

    if (days < 0) {
      months -= 1;
      var prev = new Date(b.getFullYear(), b.getMonth(), 0).getDate();
      days += prev;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    var total = years * 12 + months;
    if (days > 0) total += 1;
    return Math.max(0, total);
  }

  function annualGross(monthly, pagas) {
    return monthly * pagas;
  }

  function dailySalary(monthly, pagas) {
    return annualGross(monthly, pagas) / 365;
  }

  function monthlyEquivalent(monthly, pagas) {
    return annualGross(monthly, pagas) / 12;
  }

  function pendingMonthPay(monthly, daysWorked) {
    var days = Math.min(31, Math.max(0, daysWorked));
    return (monthly / 30) * days;
  }

  function vacationPay(monthly, unusedDays) {
    return (monthly / 30) * Math.max(0, unusedDays);
  }

  /**
   * Pagas extras no prorrateadas en la nómina mensual.
   * Si hay 14 pagas, hay 2 extras de un sueldo mensual cada una,
   * que se devengan a lo largo del año (2/12 por mes).
   */
  function extraPaysAccrued(monthly, pagas, monthsAccrued, extrasAlreadyInMonthly) {
    if (extrasAlreadyInMonthly || pagas <= 12) return 0;
    var extraCount = pagas - 12;
    var months = Math.min(12, Math.max(0, monthsAccrued));
    return extraCount * monthly * (months / 12);
  }

  function vacationDaysGenerated(annualDays, yearFrom, yearTo) {
    var days = daysInclusive(yearFrom, yearTo);
    return (annualDays / 365) * days;
  }

  function indemnizacion(opts) {
    var daily = dailySalary(opts.monthly, opts.pagas);
    var months = seniorityMonths(opts.start, opts.end);
    var yearsFraction = months / 12;
    var raw = daily * opts.daysPerYear * yearsFraction;
    var cap = monthlyEquivalent(opts.monthly, opts.pagas) * opts.maxMonthlySalaries;
    var amount = Math.min(raw, cap);
    return {
      daily: daily,
      months: months,
      yearsFraction: yearsFraction,
      raw: raw,
      cap: cap,
      capped: raw > cap,
      amount: amount,
    };
  }

  function finiquitoBajaVoluntaria(input) {
    var monthly = Number(input.monthly) || 0;
    var pagas = Number(input.pagas) || 14;
    var daysWorked = Number(input.daysWorked) || 0;
    var unusedVacation = Number(input.unusedVacation);
    var extrasInMonthly = Boolean(input.extrasInMonthly);
    var monthsExtras = Number(input.monthsExtras) || 0;
    var start = parseISODate(input.start);
    var end = parseISODate(input.end);
    var annualVacation = Number(input.annualVacation) || 30;

    if (!start || !end || end < start) {
      return { error: "Revisa las fechas: el cese no puede ser anterior al alta." };
    }

    var salarioPendiente = pendingMonthPay(monthly, daysWorked);

    var vacationDays = unusedVacation;
    if (input.autoVacation) {
      var yearStart = new Date(end.getFullYear(), 0, 1);
      var from = start > yearStart ? start : yearStart;
      var generated = vacationDaysGenerated(annualVacation, from, end);
      vacationDays = Math.max(0, generated - (Number(input.vacationTaken) || 0));
    }

    var vacaciones = vacationPay(monthly, vacationDays);
    var pagasExtra = extraPaysAccrued(monthly, pagas, monthsExtras, extrasInMonthly);
    var total = salarioPendiente + vacaciones + pagasExtra;

    return {
      monthly: monthly,
      pagas: pagas,
      daysWorked: daysWorked,
      vacationDays: vacationDays,
      salarioPendiente: salarioPendiente,
      vacaciones: vacaciones,
      pagasExtra: pagasExtra,
      indemnizacion: 0,
      total: total,
      daily: dailySalary(monthly, pagas),
    };
  }

  function despidoObjetivo(input) {
    var monthly = Number(input.monthly) || 0;
    var pagas = Number(input.pagas) || 14;
    var start = parseISODate(input.start);
    var end = parseISODate(input.end);
    if (!start || !end || end < start) {
      return { error: "Revisa las fechas: el cese no puede ser anterior al alta." };
    }

    var fin = finiquitoBajaVoluntaria(input);
    if (fin.error) return fin;

    var ind = indemnizacion({
      monthly: monthly,
      pagas: pagas,
      start: start,
      end: end,
      daysPerYear: 20,
      maxMonthlySalaries: 12,
    });

    fin.indemnizacion = ind.amount;
    fin.indemnizacionDetalle = ind;
    fin.totalConIndemnizacion = fin.total + ind.amount;
    return fin;
  }

  function vacacionesNoDisfrutadas(input) {
    var monthly = Number(input.monthly) || 0;
    var annualDays = Number(input.annualDays) || 30;
    var taken = Number(input.taken) || 0;
    var start = parseISODate(input.start);
    var end = parseISODate(input.end);
    if (!start || !end || end < start) {
      return { error: "Revisa las fechas." };
    }

    var yearStart = new Date(end.getFullYear(), 0, 1);
    var from = start > yearStart ? start : yearStart;
    var generated = vacationDaysGenerated(annualDays, from, end);
    var pending = Math.max(0, generated - taken);
    var amount = vacationPay(monthly, pending);
    var perDay = monthly / 30;

    return {
      from: from,
      to: end,
      generated: generated,
      taken: taken,
      pending: pending,
      perDay: perDay,
      amount: amount,
      annualDays: annualDays,
    };
  }

  function despidoConRegla(input, daysPerYear, maxMonthlySalaries) {
    var monthly = Number(input.monthly) || 0;
    var pagas = Number(input.pagas) || 14;
    var start = parseISODate(input.start);
    var end = parseISODate(input.end);
    if (!start || !end || end < start) {
      return { error: "Revisa las fechas: el cese no puede ser anterior al alta." };
    }
    var fin = finiquitoBajaVoluntaria(input);
    if (fin.error) return fin;
    var ind = indemnizacion({
      monthly: monthly,
      pagas: pagas,
      start: start,
      end: end,
      daysPerYear: daysPerYear,
      maxMonthlySalaries: maxMonthlySalaries,
    });
    fin.indemnizacion = ind.amount;
    fin.indemnizacionDetalle = ind;
    fin.totalConIndemnizacion = fin.total + ind.amount;
    fin.regla = { daysPerYear: daysPerYear, maxMonthlySalaries: maxMonthlySalaries };
    return fin;
  }

  function despidoImprocedente(input) {
    return despidoConRegla(input, 33, 24);
  }

  function finContratoTemporal(input) {
    return despidoConRegla(input, 12, 999);
  }

  function comparativaDespido(input) {
    var obj = despidoConRegla(input, 20, 12);
    var imp = despidoConRegla(input, 33, 24);
    if (obj.error) return obj;
    return {
      objetivo: obj,
      improcedente: imp,
      diferencia: imp.indemnizacion - obj.indemnizacion,
    };
  }

  var SS_INDEFINIDO = 0.065;
  var SS_TEMPORAL = 0.0655;
  var SMI_ANUAL_2026 = 17094;
  var IRPF_MINIMO_PERSONAL = 5550;
  var IRPF_TRAMOS = [
    { hasta: 12450, tipo: 0.19 },
    { hasta: 20200, tipo: 0.24 },
    { hasta: 35200, tipo: 0.3 },
    { hasta: 60000, tipo: 0.37 },
    { hasta: 300000, tipo: 0.45 },
    { hasta: Infinity, tipo: 0.47 },
  ];

  function irpfEstimado(base) {
    var remaining = Math.max(0, base);
    var last = 0;
    var tax = 0;
    for (var i = 0; i < IRPF_TRAMOS.length && remaining > 0; i++) {
      var ceiling = IRPF_TRAMOS[i].hasta;
      var slice = Math.min(remaining, ceiling - last);
      tax += slice * IRPF_TRAMOS[i].tipo;
      remaining -= slice;
      last = ceiling;
    }
    return tax;
  }

  function sueldoNeto(input) {
    var monthly = Number(input.monthly) || 0;
    var pagas = Number(input.pagas) || 14;
    var temporal = Boolean(input.temporal);
    var annual = annualGross(monthly, pagas);
    var ssRate = temporal ? SS_TEMPORAL : SS_INDEFINIDO;
    var ssAnnual = annual * ssRate;
    var taxable = annual - ssAnnual - IRPF_MINIMO_PERSONAL;
    var irpfAnnual = annual <= SMI_ANUAL_2026 ? 0 : irpfEstimado(taxable);
    var netoAnnual = annual - ssAnnual - irpfAnnual;
    return {
      annual: annual,
      ssRate: ssRate,
      ssAnnual: ssAnnual,
      ssMonthly: ssAnnual / pagas,
      irpfAnnual: irpfAnnual,
      irpfMonthly: irpfAnnual / pagas,
      netoAnnual: netoAnnual,
      netoPaga: netoAnnual / pagas,
      taxable: Math.max(0, taxable),
      smiExempt: annual <= SMI_ANUAL_2026,
    };
  }

  var PARO_TABLA = [
    [360, 539, 120],
    [540, 719, 180],
    [720, 899, 240],
    [900, 1079, 300],
    [1080, 1259, 360],
    [1260, 1439, 420],
    [1440, 1619, 480],
    [1620, 1799, 540],
    [1800, 1979, 600],
    [1980, 2159, 660],
    [2160, Infinity, 720],
  ];
  var IPREM_SEXTA = 700;

  function paroTopes(hijos) {
    var n = Number(hijos) || 0;
    var min = n >= 1 ? 1.07 * IPREM_SEXTA : 0.8 * IPREM_SEXTA;
    var max = n >= 2 ? 2.25 * IPREM_SEXTA : n === 1 ? 2 * IPREM_SEXTA : 1.75 * IPREM_SEXTA;
    return { min: min, max: max };
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function paro(input) {
    var daysQuoted = Number(input.daysQuoted) || 0;
    var base = Number(input.base) || 0;
    var hijos = Number(input.hijos) || 0;
    if (daysQuoted < 360) {
      return { error: "Hace falta un mínimo de 360 días cotizados en los últimos 6 años." };
    }
    var duration = 120;
    for (var i = 0; i < PARO_TABLA.length; i++) {
      if (daysQuoted >= PARO_TABLA[i][0] && daysQuoted <= PARO_TABLA[i][1]) {
        duration = PARO_TABLA[i][2];
        break;
      }
    }
    var topes = paroTopes(hijos);
    var firstRaw = base * 0.7;
    var laterRaw = base * 0.6;
    var first = clamp(firstRaw, topes.min, topes.max);
    var later = clamp(laterRaw, topes.min, topes.max);
    var days70 = Math.min(180, duration);
    var days60 = Math.max(0, duration - 180);
    var total = (first / 30) * days70 + (later / 30) * days60;
    return {
      durationDays: duration,
      durationMonths: duration / 30,
      first: first,
      later: later,
      firstRaw: firstRaw,
      laterRaw: laterRaw,
      topes: topes,
      days70: days70,
      days60: days60,
      total: total,
    };
  }

  var AUTONOMOS_TRAMOS = [
    { label: "Reducida 1 (≤ 670 €)", maxNet: 670, minBase: 653.59, maxBase: 718.94 },
    { label: "Reducida 2 (670–900 €)", maxNet: 900, minBase: 718.95, maxBase: 900 },
    { label: "Reducida 3 (900–1.166,69 €)", maxNet: 1166.69, minBase: 849.67, maxBase: 1166.7 },
    { label: "General 1 (1.166,70–1.300 €)", maxNet: 1300, minBase: 950.98, maxBase: 1300 },
    { label: "General 2 (1.300–1.500 €)", maxNet: 1500, minBase: 960.78, maxBase: 1500 },
    { label: "General 3 (1.500–1.700 €)", maxNet: 1700, minBase: 960.78, maxBase: 1700 },
    { label: "General 4 (1.700–1.850 €)", maxNet: 1850, minBase: 1143.79, maxBase: 1850 },
    { label: "General 5 (1.850–2.030 €)", maxNet: 2030, minBase: 1209.15, maxBase: 2030 },
    { label: "General 6 (2.030–2.330 €)", maxNet: 2330, minBase: 1274.51, maxBase: 2330 },
    { label: "General 7 (2.330–2.760 €)", maxNet: 2760, minBase: 1356.21, maxBase: 2760 },
    { label: "General 8 (2.760–3.190 €)", maxNet: 3190, minBase: 1437.91, maxBase: 3190 },
    { label: "General 9 (3.190–3.620 €)", maxNet: 3620, minBase: 1519.61, maxBase: 3620 },
    { label: "General 10 (3.620–4.050 €)", maxNet: 4050, minBase: 1601.31, maxBase: 4050 },
    { label: "General 11 (4.050–6.000 €)", maxNet: 6000, minBase: 1732.03, maxBase: 5101.2 },
    { label: "General 12 (> 6.000 €)", maxNet: Infinity, minBase: 1928.1, maxBase: 5101.2 },
  ];
  var AUTONOMOS_TIPO = 0.314;

  function autonomosTramo(netMonthly) {
    var n = Number(netMonthly) || 0;
    for (var i = 0; i < AUTONOMOS_TRAMOS.length; i++) {
      if (n <= AUTONOMOS_TRAMOS[i].maxNet) return AUTONOMOS_TRAMOS[i];
    }
    return AUTONOMOS_TRAMOS[AUTONOMOS_TRAMOS.length - 1];
  }

  function cuotaAutonomos(input) {
    var net = Number(input.netMonthly) || 0;
    var tramo = autonomosTramo(net);
    var base = Number(input.base);
    if (!base) base = tramo.minBase;
    base = Math.min(tramo.maxBase, Math.max(tramo.minBase, base));
    var cuota = base * AUTONOMOS_TIPO;
    return { tramo: tramo, base: base, tipo: AUTONOMOS_TIPO, cuota: cuota, anual: cuota * 12 };
  }

  function preaviso(input) {
    var monthly = Number(input.monthly) || 0;
    var days = Number(input.days);
    if (!days && days !== 0) days = 15;
    var amount = (monthly / 30) * days;
    return { days: days, daily: monthly / 30, amount: amount };
  }

  function horasExtra(input) {
    var monthly = Number(input.monthly) || 0;
    var pagas = Number(input.pagas) || 14;
    var hours = Number(input.hours) || 0;
    var multiplier = Number(input.multiplier) || 1.75;
    var yearlyHours = Number(input.yearlyHours) || 1826;
    var hourly = annualGross(monthly, pagas) / yearlyHours;
    var amount = hours * hourly * multiplier;
    return { hourly: hourly, extraHour: hourly * multiplier, hours: hours, multiplier: multiplier, amount: amount };
  }

  function euros(n) {
    return (Math.round(n * 100) / 100).toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR",
    });
  }

  function num(n, digits) {
    return (Math.round(n * Math.pow(10, digits)) / Math.pow(10, digits)).toLocaleString(
      "es-ES",
      { minimumFractionDigits: digits, maximumFractionDigits: digits }
    );
  }

  return {
    parseISODate: parseISODate,
    seniorityMonths: seniorityMonths,
    daysInclusive: daysInclusive,
    annualGross: annualGross,
    dailySalary: dailySalary,
    pendingMonthPay: pendingMonthPay,
    vacationPay: vacationPay,
    extraPaysAccrued: extraPaysAccrued,
    vacationDaysGenerated: vacationDaysGenerated,
    indemnizacion: indemnizacion,
    finiquitoBajaVoluntaria: finiquitoBajaVoluntaria,
    despidoObjetivo: despidoObjetivo,
    despidoImprocedente: despidoImprocedente,
    finContratoTemporal: finContratoTemporal,
    comparativaDespido: comparativaDespido,
    sueldoNeto: sueldoNeto,
    paro: paro,
    cuotaAutonomos: cuotaAutonomos,
    autonomosTramo: autonomosTramo,
    preaviso: preaviso,
    horasExtra: horasExtra,
    vacacionesNoDisfrutadas: vacacionesNoDisfrutadas,
    irpfEstimado: irpfEstimado,
    euros: euros,
    num: num,
  };
});
