import { useState } from "react";

import {
  type SocialProvider,
  socialProviderConfigs,
} from "@/features/onboarding/constants/socialProviders";

type SocialAuthorizeUrlResponse = Readonly<{
  success: boolean;
  message: string;
  data?: Readonly<{
    authorizeUrl?: string;
    state?: string;
  }>;
  errorCode?: string | null;
}>;

function createOAuthState() {
  if (window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * BFF 소셜 로그인: FE → Next proxy(authorize-url) → Provider → BE callback → 쿠키 set → FE /auth/callback.
 */
export function useSocialLogin() {
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(
    null,
  );
  const [loginErrorMessage, setLoginErrorMessage] = useState("");

  const startSocialLogin = async (provider: SocialProvider) => {
    const providerConfig = socialProviderConfigs[provider];
    setLoadingProvider(provider);
    setLoginErrorMessage("");

    try {
      const state = createOAuthState();
      const params = new URLSearchParams({ state });
      const response = await fetch(
        `/api/auth/${provider}/authorize-url?${params.toString()}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error(`Failed to create ${provider} authorize URL.`);
      }

      const result = (await response.json()) as SocialAuthorizeUrlResponse;
      const authorizeUrl = result.data?.authorizeUrl;

      if (!result.success || !authorizeUrl) {
        throw new Error(result.message || "소셜 로그인 URL을 받지 못했습니다.");
      }

      window.location.assign(authorizeUrl);
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      setLoginErrorMessage(
        `${providerConfig.label}을 시작하지 못했어요. 다시 시도해주세요.`,
      );
      setLoadingProvider(null);
    }
  };

  return {
    loadingProvider,
    loginErrorMessage,
    startSocialLogin,
  };
}
