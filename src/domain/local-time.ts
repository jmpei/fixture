// Converts a form's local date and time in a league's time zone to a UTC instant, and back.
import { TZDate } from "@date-fns/tz";

/** Reads `YYYY-MM-DD` and `HH:mm` as wall-clock time in `timeZone`. Throws on impossible values. */
export function localDateTime(date: string, time: string, timeZone: string): Date {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dateMatch || !timeMatch) throw new Error(`Invalid local date or time: ${date} ${time}`);
  const [year, month, day] = dateMatch.slice(1).map(Number);
  const [hour, minute] = timeMatch.slice(1).map(Number);
  const result = new TZDate(year, month - 1, day, hour, minute, timeZone);
  if (result.getMonth() !== month - 1 || result.getDate() !== day || result.getHours() !== hour) {
    throw new Error(`Invalid local date or time: ${date} ${time}`);
  }
  return new Date(+result);
}

/** The local `YYYY-MM-DD` date and `HH:mm` time of `instant` in `timeZone`. */
export function toLocal(instant: Date, timeZone: string): { date: string; time: string } {
  const local = new TZDate(+instant, timeZone);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}`,
    time: `${pad(local.getHours())}:${pad(local.getMinutes())}`,
  };
}
