/**
 * Client-side aggregations for the dashboard and reports. The backend has no summary
 * endpoints for these, so they are computed from the list endpoints.
 */
import { humanize, shortDate, type Row } from "./resources";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const sum = (rows: Row[], key: keyof Row) =>
  rows.reduce((total, row) => total + Number(row[key] ?? 0), 0);

export const isSettled = (payment: Row) => payment.status === "SUCCESSFUL";

export function feeTotals(invoices: Row[], payments: Row[]) {
  const live = invoices.filter((i) => i.status !== "CANCELLED");
  return {
    invoiced: sum(live, "total_amount"),
    outstanding: sum(live, "balance"),
    collected: sum(payments.filter(isSettled), "amount"),
    accountsInArrears: new Set(live.filter((i) => Number(i.balance) > 0).map((i) => i.student))
      .size,
  };
}

/** Invoiced vs collected per month for one calendar year. */
export function monthlyFinance(invoices: Row[], payments: Row[], year = new Date().getFullYear()) {
  const series = MONTHS.map((month) => ({ month, invoiced: 0, collected: 0 }));
  const monthOf = (value: unknown) => {
    const d = new Date(String(value));
    return d.getFullYear() === year ? d.getMonth() : -1;
  };
  for (const invoice of invoices) {
    const m = monthOf(invoice.issue_date);
    if (m >= 0 && invoice.status !== "CANCELLED")
      series[m]!.invoiced += Number(invoice.total_amount);
  }
  for (const payment of payments.filter(isSettled)) {
    const m = monthOf(payment.payment_date);
    if (m >= 0) series[m]!.collected += Number(payment.amount);
  }
  // Trim trailing empty months so the chart ends at the latest activity.
  let last = series.length - 1;
  while (last > 0 && !series[last]!.invoiced && !series[last]!.collected) last -= 1;
  return series.slice(0, last + 1);
}

export function statusMix(students: Row[]) {
  const counts = new Map<string, number>();
  for (const student of students) {
    const status = humanize(student.status);
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }
  return [...counts.entries()].map(([name, value]) => ({ name, value }));
}

/** Present-or-late share of all records marked per day (the latest `days` days with data). */
export function attendanceTrend(sessions: Row[], days = 14) {
  const byDay = new Map<string, { attended: number; total: number }>();
  for (const session of sessions) {
    const records = (session.records as { status: string }[] | undefined) ?? [];
    if (!records.length) continue;
    const day = String(session.attendance_date);
    const entry = byDay.get(day) ?? { attended: 0, total: 0 };
    for (const record of records) {
      entry.total += 1;
      if (record.status === "PRESENT" || record.status === "LATE") entry.attended += 1;
    }
    byDay.set(day, entry);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-days)
    .map(([day, { attended, total }]) => ({
      day: shortDate(day).slice(0, 6),
      rate: Math.round((attended / total) * 1000) / 10,
      attended,
      total,
    }));
}

/** Mean result percentage grouped by any key derived from the result's exam. */
export function meanBy(results: Row[], exams: Row[], group: (exam: Row) => string) {
  const examById = new Map(exams.map((e) => [e.id, e]));
  const sums = new Map<string, { total: number; n: number }>();
  for (const result of results) {
    const exam = examById.get(Number(result.exam));
    if (!exam) continue;
    const key = group(exam);
    const entry = sums.get(key) ?? { total: 0, n: 0 };
    entry.total += Number(result.percentage);
    entry.n += 1;
    sums.set(key, entry);
  }
  return [...sums.entries()].map(([name, { total, n }]) => ({
    name,
    mean: Math.round((total / n) * 10) / 10,
  }));
}

/** Compact KES for KPI tiles: 1,250,000 -> "KES 1.25M". */
export function compactMoney(value: number) {
  if (Math.abs(value) >= 1_000_000) return `KES ${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `KES ${(value / 1_000).toFixed(1)}K`;
  return `KES ${value.toLocaleString("en-KE")}`;
}
