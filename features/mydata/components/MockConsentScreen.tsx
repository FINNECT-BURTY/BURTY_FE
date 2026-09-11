"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  buildConsentRedirect,
  type ConsentDecision,
  describeScope,
  isAllowedRedirect,
  isLoopback,
  mockAuthorizationCode,
} from "@/features/mydata/api/mockConsent";
import { institutionName } from "@/features/mypage";
import { getPublicApiBaseUrl } from "@/shared/api/config";

/**
 * 모의 정보제공자의 동의 화면.
 *
 * <p>실제 연동에서는 은행이 자기 도메인에 띄우는 화면이다. 개발·시연 환경에서는 은행이 없으므로
 * 여기서 흉내 낸다. 동의하면 정보제공자처럼 인가 코드를 붙여 백엔드 콜백으로 돌려보낸다.
 *
 * <p>실제 은행 화면으로 오해하지 않게 모의임을 크게 적는다.
 */
export function MockConsentScreen() {
  const params = useSearchParams();
  const orgCode = params.get("org_code");
  const state = params.get("state");
  const redirectUri = params.get("redirect_uri");
  const scopes = describeScope(params.get("scope"));
  const [isLeaving, setIsLeaving] = useState(false);

  const isValid =
    Boolean(orgCode) &&
    Boolean(state) &&
    isAllowedRedirect(redirectUri, allowedOrigins(), { allowLoopback: isLoopbackApp() });

  const handleDecision = (decision: ConsentDecision) => {
    if (!isValid || !redirectUri || !state || isLeaving) return;
    setIsLeaving(true);
    window.location.assign(
      buildConsentRedirect(redirectUri, state, decision, mockAuthorizationCode()),
    );
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background px-6 pb-8 pt-10 text-grayscale-1000">
      <p className="text-caption w-fit rounded-full bg-yellow-200 px-3 py-1 text-grayscale-900">
        모의 인증 화면 · 개발·시연용
      </p>

      {isValid ? (
        <>
          <h1 className="text-title-lg mt-4">
            {institutionName(orgCode ?? "")}
            <span className="text-title-md text-grayscale-600"> (모의)</span>
          </h1>
          <p className="text-body-md mt-2 text-grayscale-800">
            버티가 다음 정보의 전송을 요청해요
          </p>

          <ul className="mt-6 space-y-2">
            {scopes.map((scope) => (
              <li
                className="text-body-lg rounded-2xl border border-grayscale-100 px-5 py-4"
                key={scope}
              >
                {scope}
              </li>
            ))}
          </ul>

          <p className="text-caption mt-4 text-grayscale-600">
            실제 은행에 연결되지 않아요. 동의하면 모의 계좌와 거래내역이 연결돼요.
          </p>

          <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
            <button
              className="text-title-sm h-12 rounded-2xl bg-grayscale-200 text-grayscale-700 disabled:opacity-60"
              disabled={isLeaving}
              onClick={() => handleDecision("deny")}
              type="button"
            >
              거절
            </button>
            <button
              className="text-title-sm h-12 rounded-2xl bg-yellow-400 text-grayscale-1000 disabled:bg-grayscale-200 disabled:text-grayscale-700"
              disabled={isLeaving}
              onClick={() => handleDecision("agree")}
              type="button"
            >
              {isLeaving ? "이동 중" : "동의하고 연결"}
            </button>
          </div>
        </>
      ) : (
        // 잘못된 요청에서는 어디로도 보내지 않는다. 버튼을 두면 검증을 우회할 여지가 생긴다.
        <p className="text-body-lg mt-6 text-grayscale-800" role="alert">
          잘못된 연결 요청이에요. 앱에서 다시 시작해주세요.
        </p>
      )}
    </main>
  );
}

/** 돌려보내도 되는 출처 — 백엔드 API 와, 같은 출처 프록시로 붙은 경우의 앱 자신. */
function allowedOrigins(): readonly string[] {
  const origins: string[] = [];
  try {
    origins.push(new URL(getPublicApiBaseUrl()).origin);
  } catch {
    // 설정이 깨졌으면 그 출처는 허용하지 않는다.
  }
  if (typeof window !== "undefined") origins.push(window.location.origin);
  return origins;
}

function isLoopbackApp(): boolean {
  return typeof window !== "undefined" && isLoopback(window.location.hostname);
}
