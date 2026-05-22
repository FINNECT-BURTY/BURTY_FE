import { useState } from "react";

import {
  createBirthDayOptions,
  formatBirthDate,
  getBirthDateDayCount,
  isValidBirthDate,
} from "@/features/onboarding/lib/birthDate";

export function useBirthDateSelect() {
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");

  const birthDayOptions = createBirthDayOptions(birthYear, birthMonth);
  const birthDate =
    birthYear && birthMonth && birthDay
      ? formatBirthDate(birthYear, birthMonth, birthDay)
      : "";
  const isValid = isValidBirthDate(birthDate);

  const handleBirthYearChange = (nextYear: string) => {
    setBirthYear(nextYear);
    if (birthDay && Number(birthDay) > getBirthDateDayCount(nextYear, birthMonth)) {
      setBirthDay("");
    }
  };

  const handleBirthMonthChange = (nextMonth: string) => {
    setBirthMonth(nextMonth);
    if (birthDay && Number(birthDay) > getBirthDateDayCount(birthYear, nextMonth)) {
      setBirthDay("");
    }
  };

  return {
    birthDate,
    birthDay,
    birthDayOptions,
    birthMonth,
    birthYear,
    handleBirthMonthChange,
    handleBirthYearChange,
    isValid,
    setBirthDay,
  };
}
