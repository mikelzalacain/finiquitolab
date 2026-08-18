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
    vacacionesNoDisfrutadas: vacacionesNoDisfrutadas,
    euros: euros,
    num: num,
  };
});
