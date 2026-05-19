const MAX_BIRTH_DATE_AGE = 120;
const birthCurrentYear = new Date().getFullYear();

export const birthYearOptions = Array.from(
  { length: MAX_BIRTH_DATE_AGE + 1 },
  (_, index) => String(birthCurrentYear - index),
);

export const birthMonthOptions = Array.from({ length: 12 }, (_, index) =>
  String(index + 1),
);

export function formatBirthDate(year: string, month: string, day: string) {
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function getBirthDateDayCount(year: string, month: string) {
  if (!month) return 31;

  const safeYear = Number(year || birthCurrentYear);
  return new Date(safeYear, Number(month), 0).getDate();
}

export function createBirthDayOptions(year: string, month: string) {
  return Array.from(
    { length: getBirthDateDayCount(year, month) },
    (_, index) => String(index + 1),
  );
}

export function isValidBirthDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const min = new Date(
    now.getFullYear() - MAX_BIRTH_DATE_AGE,
    now.getMonth(),
    now.getDate(),
  );

  return date <= now && date >= min;
}

export function toAgeRange(birthDate: string) {
  if (!isValidBirthDate(birthDate)) return undefined;

  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age -= 1;
  }

  return Math.floor(age / 10) * 10;
}
