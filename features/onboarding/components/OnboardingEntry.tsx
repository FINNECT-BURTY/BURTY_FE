"use client";

import Image from "next/image";
import { Fragment, useState } from "react";

import {
  socialProviderConfigs,
  socialProviders,
} from "@/features/onboarding/constants/socialProviders";
import { useEmailLogin } from "@/features/onboarding/hooks/useEmailLogin";
import { useSocialLogin } from "@/features/onboarding/hooks/useSocialLogin";

const inactiveAuthLinks = [
  { id: "find-id", label: "아이디 찾기" },
  { id: "find-password", label: "비밀번호 찾기" },
  { id: "signup", label: "회원가입" },
] as const;

const inputClassName =
  "text-body-md h-13 w-full rounded-2xl border border-grayscale-200 bg-background px-5 py-4 text-grayscale-1000 placeholder:text-grayscale-800";

function CheckIcon({ checked }: Readonly<{ checked: boolean }>) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-6 shrink-0 items-center justify-center rounded ${
        checked ? "bg-yellow-400" : "bg-grayscale-200"
      }`}
    >
      <Image
        alt=""
        aria-hidden="true"
        className="brightness-0 invert"
        height={24}
        src="/icons/onboarding/checkmark.svg"
        width={24}
      />
    </span>
  );
}

export function OnboardingEntry() {
  const { loadingProvider, loginErrorMessage, startSocialLogin } =
    useSocialLogin();
  const {
    errorMessage: emailLoginError,
    isSubmitting: isEmailLoginSubmitting,
    submitEmailLogin,
  } = useEmailLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const isAuthInProgress = isEmailLoginSubmitting || loadingProvider !== null;

  const handleEmailLogin = () => {
    if (isAuthInProgress) return;
    void submitEmailLogin({ email, password });
  };

  const handleEmailFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleEmailLogin();
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-main-background px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-20 text-grayscale-1000">
      <header className="flex justify-center">
        <Image
          alt="BURTY"
          height={40}
          priority
          src="/icons/onboarding/logo.svg"
          width={160}
        />
      </header>

      <form
        className="mt-14 flex flex-col"
        noValidate
        onSubmit={handleEmailFormSubmit}
      >
        <section className="flex flex-col gap-2">
          <input
            autoComplete="email"
            className={inputClassName}
            disabled={isAuthInProgress}
            inputMode="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="이메일을 입력해 주세요"
            type="email"
            value={email}
          />
          <input
            autoComplete="current-password"
            className={inputClassName}
            disabled={isAuthInProgress}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호를 입력해 주세요"
            type="password"
            value={password}
          />
        </section>

        <button
          aria-checked={keepLoggedIn}
          className="mt-4 flex w-fit items-center gap-2 self-start"
          onClick={() => setKeepLoggedIn((current) => !current)}
          role="checkbox"
          type="button"
        >
          <CheckIcon checked={keepLoggedIn} />
          <span className="text-caption text-grayscale-700">로그인 상태 유지</span>
        </button>

        <button
          aria-busy={isEmailLoginSubmitting}
          className="text-title-md mt-4 flex h-13 w-full items-center justify-center rounded-2xl bg-yellow-400 text-grayscale-1000 disabled:cursor-not-allowed"
          disabled={isAuthInProgress}
          type="submit"
        >
          로그인
        </button>

        {emailLoginError ? (
          <p
            aria-live="polite"
            className="text-caption mt-3 text-center text-red"
            role="alert"
          >
            {emailLoginError}
          </p>
        ) : null}

        <nav className="mt-4 flex items-center justify-center">
          {inactiveAuthLinks.map((link, index) => (
            <Fragment key={link.id}>
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className="mx-3 h-3 w-px bg-grayscale-300"
                />
              ) : null}
              <button
                className="text-caption px-1 py-1 text-grayscale-700"
                type="button"
              >
                {link.label}
              </button>
            </Fragment>
          ))}
        </nav>
      </form>

      <section
        aria-label="소셜 계정으로 시작하기"
        className="mt-auto flex justify-center gap-10 pt-12 pb-15"
      >
        {socialProviders.map((provider) => {
          const providerConfig = socialProviderConfigs[provider];

          return (
            <button
              aria-label={providerConfig.label.replace(/\n/g, " ")}
              className="flex flex-col items-center gap-3 disabled:opacity-60"
              disabled={isAuthInProgress}
              key={provider}
              onClick={() => startSocialLogin(provider)}
              type="button"
            >
              <span
                className={`flex size-14 items-center justify-center rounded-full ${providerConfig.iconBackgroundClassName}`}
              >
                <Image
                  alt=""
                  aria-hidden="true"
                  height={22}
                  src={providerConfig.iconSrc}
                  width={22}
                />
              </span>
              <span className="text-caption whitespace-pre-line text-center text-grayscale-800">
                {providerConfig.label}
              </span>
            </button>
          );
        })}
      </section>

      {loginErrorMessage && !emailLoginError ? (
        <p className="text-caption mt-3 text-center text-grayscale-700">
          {loginErrorMessage}
        </p>
      ) : null}
    </main>
  );
}
