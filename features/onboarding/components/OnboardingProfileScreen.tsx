"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { OnboardingHeader } from "@/shared/layout/OnboardingHeader";

type ProfileResponse = Readonly<{
  success: boolean;
  message: string;
  data?: Readonly<{
    completed?: boolean;
    alreadyRegistered?: boolean;
  }>;
  errorCode?: string | null;
}>;

type UxMode = "STANDARD" | "SENIOR";

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

export function OnboardingProfileScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [uxMode, setUxMode] = useState<UxMode>("STANDARD");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const normalizedPhone = onlyDigits(phone);
  const canSubmit = useMemo(
    () =>
      normalizedPhone.length >= 10 &&
      normalizedPhone.length <= 11 &&
      name.trim().length >= 2 &&
      isValidBirthDate(birthDate) &&
      termsAccepted &&
      !isSubmitting,
    [birthDate, isSubmitting, name, normalizedPhone, termsAccepted],
  );

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/onboarding/profile", {
        body: JSON.stringify({
          phone: normalizedPhone,
          name: name.trim(),
          birthDate,
          ageRange: toAgeRange(birthDate),
          uxMode,
          termsAccepted,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const result = (await response.json()) as ProfileResponse;
      if (!response.ok || !result.success || !result.data?.completed) {
        throw new Error(result.message || "Profile onboarding failed.");
      }

      window.sessionStorage.removeItem("burty:onboarding-profile-required");
      router.replace("/");
    } catch (error) {
      console.error("Profile onboarding failed:", error);
      setErrorMessage("추가 정보를 저장하지 못했어요. 입력값을 확인해 주세요.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
      <OnboardingHeader title="추가 정보" />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-6">
        <h1 className="text-title-lg text-grayscale-1000">
          버티를 시작하기 전에
          <br />
          필요한 정보를 확인할게요
        </h1>
        <p className="text-body-md mt-2 text-grayscale-800">
          입력한 정보는 본인 확인과 맞춤 안내에만 사용돼요.
        </p>

        <div className="mt-8 flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-title-sm text-grayscale-1000">이름</span>
            <input
              className="text-body-lg h-13 rounded-2xl border border-grayscale-200 bg-white px-4 text-grayscale-1000 outline-none focus:border-yellow-500"
              maxLength={30}
              onChange={(event) => setName(event.target.value)}
              placeholder="실명을 입력해 주세요"
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
              placeholder="01012345678"
              value={phone}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-title-sm text-grayscale-1000">생년월일</span>
            <input
              className="text-body-lg h-13 rounded-2xl border border-grayscale-200 bg-white px-4 text-grayscale-1000 outline-none focus:border-yellow-500"
              onChange={(event) => setBirthDate(event.target.value)}
              type="date"
              value={birthDate}
            />
          </label>

          <fieldset className="flex flex-col gap-3">
            <legend className="text-title-sm text-grayscale-1000">
              화면 모드
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {(["STANDARD", "SENIOR"] as const).map((mode) => (
                <button
                  className={`text-title-sm h-12 rounded-2xl border ${
                    uxMode === mode
                      ? "border-yellow-500 bg-yellow-100 text-grayscale-1000"
                      : "border-grayscale-200 bg-white text-grayscale-700"
                  }`}
                  key={mode}
                  onClick={() => setUxMode(mode)}
                  type="button"
                >
                  {mode === "STANDARD" ? "기본" : "큰 글씨"}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex items-start gap-3 rounded-2xl bg-white p-4">
            <input
              checked={termsAccepted}
              className="mt-1 size-5 accent-yellow-500"
              onChange={(event) => setTermsAccepted(event.target.checked)}
              type="checkbox"
            />
            <span className="text-body-md text-grayscale-900">
              필수 약관과 개인정보 처리 안내를 확인했고, 추가 정보 저장에 동의합니다.
            </span>
          </label>

          {errorMessage ? (
            <p className="text-caption text-center text-grayscale-700">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </section>

      <footer className="px-6 pb-[max(30px,env(safe-area-inset-bottom))] pt-4">
        <button
          className={`text-title-md flex h-13 w-full items-center justify-center rounded-2xl ${
            canSubmit
              ? "bg-yellow-400 text-grayscale-1000"
              : "bg-grayscale-200 text-grayscale-100"
          }`}
          disabled={!canSubmit}
          onClick={handleSubmit}
          type="button"
        >
          {isSubmitting ? "저장 중..." : "완료"}
        </button>
      </footer>
    </main>
  );
}
