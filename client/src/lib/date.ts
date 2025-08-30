export type WeekRange = { start: Date; end: Date };

export function fmtYYYYMMDD(d: Date): string {
  return d.toISOString().slice(0,10);
}
