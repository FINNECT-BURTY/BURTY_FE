import { describe, expect, it } from "vitest";

import {
  buildConsentRedirect,
  describeScope,
  isAllowedRedirect,
  mockAuthorizationCode,
} from "@/features/mydata/api/mockConsent";

const API = "http://localhost:8080";
const APP = "http://localhost:3000";
const CALLBACK = `${API}/api/v1/mydata/oauth/callback`;

describe("isAllowedRedirect", () => {
  it("허용한 출처의 콜백 경로만 받는다", () => {
    expect(isAllowedRedirect(CALLBACK, [API, APP])).toBe(true);
    expect(isAllowedRedirect(`${APP}/api/v1/mydata/oauth/callback`, [API, APP])).toBe(true);
  });

  it("다른 사이트로는 보내지 않는다 — 오픈 리다이렉트", () => {
    expect(isAllowedRedirect("https://evil.example/api/v1/mydata/oauth/callback", [API])).toBe(false);
  });

  it("같은 출처라도 다른 경로로는 보내지 않는다", () => {
    expect(isAllowedRedirect(`${API}/api/v1/auth/logout`, [API])).toBe(false);
  });

  it("javascript: 나 인증정보가 섞인 주소는 거부한다", () => {
    expect(isAllowedRedirect("javascript:alert(1)", [API])).toBe(false);
    expect(isAllowedRedirect(`http://user:pw@localhost:8080/api/v1/mydata/oauth/callback`, [API])).toBe(false);
  });

  it("주소가 없거나 깨졌으면 거부한다", () => {
    expect(isAllowedRedirect(null, [API])).toBe(false);
    expect(isAllowedRedirect("not a url", [API])).toBe(false);
  });
});

describe("isAllowedRedirect — 로컬 개발", () => {
  const backendCallback = "http://localhost:8090/api/v1/mydata/oauth/callback";

  it("앱이 loopback 에서 돌면 다른 포트의 loopback 콜백도 허용한다", () => {
    // 프록시 모드에서는 API 기준 주소가 FE 자신(3200)이라 백엔드(8090) 출처가 목록에 없다.
    expect(
      isAllowedRedirect(backendCallback, ["http://localhost:3200"], { allowLoopback: true }),
    ).toBe(true);
  });

  it("운영 도메인에서는 loopback 콜백을 허용하지 않는다", () => {
    expect(isAllowedRedirect(backendCallback, ["https://burty.co.kr"])).toBe(false);
  });

  it("loopback 이어도 콜백이 아닌 경로로는 보내지 않는다", () => {
    expect(
      isAllowedRedirect("http://localhost:8090/admin", [], { allowLoopback: true }),
    ).toBe(false);
  });

  it("loopback 규칙이 켜져도 외부 사이트는 거부한다", () => {
    expect(
      isAllowedRedirect("https://evil.example/api/v1/mydata/oauth/callback", [], {
        allowLoopback: true,
      }),
    ).toBe(false);
  });
});

describe("buildConsentRedirect", () => {
  it("동의하면 code 와 state 를 붙인다", () => {
    const url = new URL(buildConsentRedirect(CALLBACK, "s-1", "agree", "mock-1"));
    expect(url.searchParams.get("code")).toBe("mock-1");
    expect(url.searchParams.get("state")).toBe("s-1");
    expect(url.searchParams.get("error")).toBeNull();
  });

  it("거절하면 code 없이 error 만 붙인다", () => {
    const url = new URL(buildConsentRedirect(CALLBACK, "s-1", "deny", "mock-1"));
    expect(url.searchParams.get("error")).toBe("access_denied");
    expect(url.searchParams.get("code")).toBeNull();
    expect(url.searchParams.get("state")).toBe("s-1");
  });
});

describe("describeScope", () => {
  it("아는 범위는 말로, 모르는 범위는 그대로 적는다", () => {
    expect(describeScope("asset.read transfer.read card.read")).toEqual([
      "계좌 목록과 잔액",
      "거래내역",
      "card.read",
    ]);
  });
});

describe("mockAuthorizationCode", () => {
  it("모의 코드임이 드러나고 매번 다르다", () => {
    const first = mockAuthorizationCode();
    expect(first.startsWith("mock-")).toBe(true);
    expect(first).not.toBe(mockAuthorizationCode());
  });
});
