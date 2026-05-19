"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { backendFetch } from "@/shared/api/backendFetch";
import { ErrorScreen } from "@/shared/layout/ErrorScreen";
import { OnboardingHeader } from "@/shared/layout/OnboardingHeader";
import { BottomActionBar } from "@/shared/ui/BottomActionBar";

type ProfileResponse = Readonly<{
  success: boolean;
  message: string;
  data?: Readonly<{
    completed?: boolean;
    alreadyRegistered?: boolean;
  }>;
  errorCode?: string | null;
}>;

type OnboardingProfileScreenProps = Readonly<{
  onBack: () => void;
  onComplete: () => void;
}>;

const currentYear = new Date().getFullYear();
const birthYearOptions = Array.from({ length: 121 }, (_, index) =>
  String(currentYear - index),
);
const birthMonthOptions = Array.from({ length: 12 }, (_, index) =>
  String(index + 1),
);
const selectClassName =
  "text-body-md h-13 w-full appearance-none rounded-2xl border border-grayscale-200 bg-background px-3 pr-8 text-grayscale-1000 outline-none";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function isValidBirthDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const min = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
  return date <= now && date >= min;
}

function toAgeRange(birthDate: string) {
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

function formatBirthDate(year: string, month: string, day: string) {
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function getDayCount(year: string, month: string) {
  if (!month) return 31;
  const safeYear = Number(year || currentYear);
  return new Date(safeYear, Number(month), 0).getDate();
}

function BirthSelect({
  ariaLabel,
  children,
  placeholder,
  value,
  onChange,
}: Readonly<{
  ariaLabel: string;
  children: ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}>) {
  return (
    <span className="relative block">
      <select
        aria-label={ariaLabel}
        className={`${selectClassName} ${value ? "" : "text-grayscale-500"}`}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option disabled hidden value="">
          {placeholder}
        </option>
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-grayscale-400"
        strokeWidth={1.6}
      />
    </span>
  );
}

export function OnboardingProfileScreen({
  onBack,
  onComplete,
}: OnboardingProfileScreenProps) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitError, setHasSubmitError] = useState(false);

  const normalizedPhone = onlyDigits(phone);
  const birthDayOptions = useMemo(
    () =>
      Array.from({ length: getDayCount(birthYear, birthMonth) }, (_, index) =>
        String(index + 1),
      ),
    [birthMonth, birthYear],
  );
  const birthDate =
    birthYear && birthMonth && birthDay
      ? formatBirthDate(birthYear, birthMonth, birthDay)
      : "";
  const canSubmit = useMemo(
    () =>
      normalizedPhone.length >= 10 &&
      normalizedPhone.length <= 11 &&
      name.trim().length >= 2 &&
      isValidBirthDate(birthDate) &&
      !isSubmitting,
    [birthDate, isSubmitting, name, normalizedPhone],
  );

  const handleBirthYearChange = (nextYear: string) => {
    setBirthYear(nextYear);
    if (birthDay && Number(birthDay) > getDayCount(nextYear, birthMonth)) {
      setBirthDay("");
    }
  };

  const handleBirthMonthChange = (nextMonth: string) => {
    setBirthMonth(nextMonth);
    if (birthDay && Number(birthDay) > getDayCount(birthYear, nextMonth)) {
      setBirthDay("");
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setHasSubmitError(false);

    try {
      const response = await backendFetch("/api/v1/onboarding/profile", {
        body: JSON.stringify({
          phone: normalizedPhone,
          name: name.trim(),
          birthDate,
          ageRange: toAgeRange(birthDate),
          // TODO: BE ProfileOnboardingRequest 정리 후 제거.
          uxMode: "STANDARD",
          termsAccepted: true,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const result = (await response.json()) as ProfileResponse;
      const profileCompleted =
        result.data?.completed === true || result.data?.alreadyRegistered === true;
      if (!response.ok || !result.success || !profileCompleted) {
        throw new Error(result.message || "Profile onboarding failed.");
      }

      onComplete();
    } catch (error) {
      console.error("Profile onboarding failed:", error);
      setIsSubmitting(false);
      setHasSubmitError(true);
    }
  };

  if (hasSubmitError) {
    return (
      <ErrorScreen
        description="입력값과 연결 상태를 확인한 뒤 다시 시도해주세요"
        headerTitle="추가 정보"
        homeHref="/onboarding?step=entry"
        homeLabel="처음으로 돌아가기"
        onBack={() => setHasSubmitError(false)}
        onRetry={() => setHasSubmitError(false)}
        retryLabel="다시 시도하기"
        title="추가 정보를 저장하지 못했어요"
      />
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
      <OnboardingHeader onBack={onBack} title="추가 정보" />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-6">
        <h1 className="text-title-lg text-grayscale-1000">
          버티를 시작하기 전에
          <br />
          필요한 정보를 확인할게요.
        </h1>
        <p className="text-body-md mt-1 text-grayscale-900">
          입력하신 정보는 본인 확인과 서비스 이용을 위해서만 사용돼요.
        </p>

        <div className="mt-8 flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-title-sm text-grayscale-1000">이름</span>
            <input
              className="text-body-lg h-13 rounded-2xl border border-grayscale-200 bg-white px-4 text-grayscale-1000 outline-none focus:border-yellow-500"
              maxLength={30}
              onChange={(event) => setName(event.target.value)}
              placeholder="본인 실명을 입력해 주세요."
              value={name}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-title-sm text-grayscale-1000">휴대폰 번호</span>
            <input
              className="text-body-lg h-13 rounded-2xl border border-grayscale-200 bg-white px-4 text-grayscale-1000 outline-none focus:border-yellow-500"
              inputMode="tel"
              maxLength={13}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="숫자만 입력해 주세요."
              value={phone}
            />
          </label>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-title-sm text-grayscale-1000">생년월일</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <BirthSelect
                ariaLabel="태어난 연도"
                onChange={handleBirthYearChange}
                placeholder="년도"
                value={birthYear}
              >
                {birthYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </BirthSelect>
              <BirthSelect
                ariaLabel="태어난 월"
                onChange={handleBirthMonthChange}
                placeholder="월"
                value={birthMonth}
              >
                {birthMonthOptions.map((month) => (
                  <option key={month} value={month}>
                    {month}월
                  </option>
                ))}
              </BirthSelect>
              <BirthSelect
                ariaLabel="태어난 일"
                onChange={setBirthDay}
                placeholder="일"
                value={birthDay}
              >
                {birthDayOptions.map((day) => (
                  <option key={day} value={day}>
                    {day}일
                  </option>
                ))}
              </BirthSelect>
            </div>
          </div>
        </div>
      </section>

      <BottomActionBar
        actionLabel="확인"
        disabled={!canSubmit}
        onAction={handleSubmit}
      />
    </main>
  );
}
