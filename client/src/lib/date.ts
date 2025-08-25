export type WeekRange = { start: Date; end: Date }; // [Mon 00:00, Sun 23:59:59.999]

const toStartOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function getISOWeekRange(date: Date = new Date()): WeekRange {
  const d = toStartOfDay(date);
  const day = (d.getDay() + 6) % 7; // 0=Mon ... 6=Sun
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23,59,59,999);
  return { start, end };
}

export function isWeekComplete(date: Date = new Date()): boolean {
  // Complete when we're **after** Sunday 23:59:59 of that ISO week
  const { end } = getISOWeekRange(date);
  return new Date() > end; // now is after week end
}

export function getDisplayWeekRange(): WeekRange {
  // If current week is not complete, show last full week instead
  if (!isWeekComplete(new Date())) {
    const { start } = getISOWeekRange(new Date());
    const lastWeekStart = new Date(start);
    lastWeekStart.setDate(start.getDate() - 7);
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
    lastWeekEnd.setHours(23,59,59,999);
    return { start: lastWeekStart, end: lastWeekEnd };
  }
  return getISOWeekRange(new Date());
}

export function fmtYYYYMMDD(d: Date): string {
  return d.toISOString().slice(0,10);
}
