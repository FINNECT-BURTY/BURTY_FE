import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { backendFetch } from "@/shared/api/backendFetch";
import { setAuthTokens, setSessionMarker } from "@/shared/auth/tokenStorage";

type EmailLoginResponseData = Readonly<{
  userId?: string;
  provider?: string;
  accessToken?: string;
  refreshToken?: string;
  newUser?: boolean;
  profileComplete?: boolean;
}>;

type EmailLoginResponse = Readonly<{
  success?: boolean;
  message?: string;
  data?: EmailLoginResponseData | null;
  errorCode?: string | null;
}>;

type EmailLoginInput = Readonly<{
  email: string;
  password: string;
}>;

type UseEmailLoginResult = Readonly<{
  errorMessage: string;
  isSubmitting: boolean;
  submitEmailLogin: (input: EmailLoginInput) => Promise<void>;
}>;

const ONBOARDING_AGREEMENT_PATH = "/onboarding?step=agreement&newUser=true";

function resolveDestination(data: EmailLoginResponseData): string {
  if (data.newUser === true || data.profileComplete === false) {
    return ONBOARDING_AGREEMENT_PATH;
  }
  // profileComplete 가 명시적으로 true 일 때만 홈으로 보낸다 (undefined 도 안전하게 온보딩).
  if (data.profileComplete === true) {
    return "/";
  }
  return ONBOARDING_AGREEMENT_PATH;
}

export function useEmailLogin(): UseEmailLoginResult {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitEmailLogin = useCallback(
    async ({ email, password }: EmailLoginInput) => {
      if (isSubmitting) return;

      setIsSubmitting(true);
      setErrorMessage("");

      try {
        const response = await backendFetch("/api/v1/auth/email/login", {
          body: JSON.stringify({ email: email.trim(), password }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });

        const result = (await response.json().catch(() => null)) as
          | EmailLoginResponse
          | null;

        if (!response.ok || result?.success !== true || !result.data) {
          setErrorMessage(
            result?.message || "로그인에 실패했어요. 다시 시도해주세요.",
          );
          setIsSubmitting(false);
          return;
        }

        const { accessToken, refreshToken } = result.data;
        if (!accessToken || !refreshToken) {
          setErrorMessage("로그인 정보를 받지 못했어요. 다시 시도해주세요.");
          setIsSubmitting(false);
          return;
        }

        setAuthTokens({ accessToken, refreshToken });
        setSessionMarker();
        router.replace(resolveDestination(result.data));
      } catch (error) {
        console.error("Email login failed:", error);
        setErrorMessage("네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
        setIsSubmitting(false);
      }
    },
    [isSubmitting, router],
  );

  return { errorMessage, isSubmitting, submitEmailLogin };
}
