import { compareAsc, isAfter, isBefore, isSameDay, startOfDay } from "date-fns";

type DateInput = string | Date | undefined;

export function parseIsoDate(value: DateInput): Date | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function isSameCalendarDay(
  value: DateInput,
  referenceDate: Date = new Date(),
): boolean {
  const date = parseIsoDate(value);

  return date ? isSameDay(date, referenceDate) : false;
}

export function isFutureDate(
  value: DateInput,
  referenceDate: Date = new Date(),
): boolean {
  const date = parseIsoDate(value);

  return date ? isAfter(startOfDay(date), startOfDay(referenceDate)) : false;
}

export function isPastDate(
  value: DateInput,
  referenceDate: Date = new Date(),
): boolean {
  const date = parseIsoDate(value);

  return date ? isBefore(startOfDay(date), startOfDay(referenceDate)) : false;
}

export function compareOptionalIsoDatesAsc(
  first: DateInput,
  second: DateInput,
): number {
  const firstDate = parseIsoDate(first);
  const secondDate = parseIsoDate(second);

  if (!firstDate && !secondDate) {
    return 0;
  }

  if (!firstDate) {
    return 1;
  }

  if (!secondDate) {
    return -1;
  }

  return compareAsc(firstDate, secondDate);
}
