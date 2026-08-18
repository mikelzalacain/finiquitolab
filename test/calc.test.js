const C = require("../js/calc.js");
const assert = require("assert");

function close(actual, expected, eps) {
  assert.ok(Math.abs(actual - expected) < (eps || 0.02), actual + " !~ " + expected);
}

// Salario pendiente y vacaciones
assert.strictEqual(C.pendingMonthPay(1500, 10), 500);
assert.strictEqual(C.vacationPay(1500, 5), 250);

// 14 pagas, 4 meses de extras: 2 * 1500 * 4/12 = 1000
close(C.extraPaysAccrued(1500, 14, 4, false), 1000);
assert.strictEqual(C.extraPaysAccrued(1500, 14, 4, true), 0);
assert.strictEqual(C.extraPaysAccrued(1500, 12, 4, false), 0);

const baja = C.finiquitoBajaVoluntaria({
  monthly: 1500,
  pagas: 14,
  start: "2024-01-15",
  end: "2026-04-10",
  daysWorked: 10,
  unusedVacation: 5,
  monthsExtras: 4,
  extrasInMonthly: false,
});
close(baja.total, 1750);
assert.strictEqual(baja.indemnizacion, 0);

// Prorrateo por meses: 1 día suelto cuenta como mes
const start = C.parseISODate("2021-03-01");
const end = C.parseISODate("2026-06-18");
assert.strictEqual(C.seniorityMonths(start, end), 64);

const daily = C.dailySalary(1800, 14);
close(daily, 25200 / 365);

const ind = C.indemnizacion({
  monthly: 1800,
  pagas: 14,
  start: start,
  end: end,
  daysPerYear: 20,
  maxMonthlySalaries: 12,
});
close(ind.amount, daily * 20 * (64 / 12));
assert.strictEqual(ind.capped, false);

// Tope 12 mensualidades
const long = C.indemnizacion({
  monthly: 2000,
  pagas: 14,
  start: C.parseISODate("2005-01-01"),
  end: C.parseISODate("2026-01-01"),
  daysPerYear: 20,
  maxMonthlySalaries: 12,
});
close(long.cap, (2000 * 14 / 12) * 12);
assert.ok(long.capped);
close(long.amount, long.cap);

// Vacaciones 2026-01-01 a 2026-08-18 = 230 días
const vac = C.vacacionesNoDisfrutadas({
  monthly: 1600,
  annualDays: 30,
  taken: 10,
  start: "2025-09-01",
  end: "2026-08-18",
});
assert.strictEqual(C.daysInclusive(new Date(2026, 0, 1), new Date(2026, 7, 18)), 230);
close(vac.generated, (30 * 230) / 365);
close(vac.pending, vac.generated - 10);

const imp = C.despidoImprocedente({
  monthly: 1800, pagas: 14, start: "2021-03-01", end: "2026-06-18",
  daysWorked: 18, unusedVacation: 8, monthsExtras: 6, extrasInMonthly: false
});
close(imp.indemnizacion, daily * 33 * (64 / 12));

const paro = C.paro({ base: 1800, daysQuoted: 1080, hijos: 0 });
assert.strictEqual(paro.durationDays, 360);
close(paro.firstRaw, 1260);
close(paro.first, 1225);

const auto = C.cuotaAutonomos({ netMonthly: 1500 });
close(auto.tramo.minBase, 960.78);
close(auto.cuota, 960.78 * 0.314);

const neto = C.sueldoNeto({ monthly: 1221, pagas: 14 });
assert.strictEqual(neto.smiExempt, true);
assert.strictEqual(neto.irpfAnnual, 0);

const extra = C.horasExtra({ monthly: 1600, pagas: 14, hours: 10, multiplier: 1.75, yearlyHours: 1826 });
close(extra.hourly, (1600 * 14) / 1826);

console.log("OK " + module.filename);
