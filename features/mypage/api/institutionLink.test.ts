import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/apiResponse", () => ({ fetchApiData: vi.fn() }));

const { fetchApiData } = await import("@/shared/api/apiResponse");
const mocked = vi.mocked(fetchApiData);

const {
  connectableInstitutions,
  describeLinkOutcome,
  readLinkOutcome,
  startInstitutionLink,
  withObjectParticle,
} = await import("@/features/mypage/api/institutionLink");

const params = (query: string) => new URLSearchParams(query);
const names: Record<string, string> = { KB: "KB국민은행", TOSS: "토스뱅크" };
const nameOf = (code: string) => names[code] ?? code;

describe("readLinkOutcome", () => {
  it("연결 성공을 읽는다", () => {
    expect(readLinkOutcome(params("linked=KB"))).toEqual({
      institutionCode: "KB",
      kind: "linked",
    });
  });

  it("거절·교환 실패·만료를 가른다", () => {
    expect(readLinkOutcome(params("link_error=denied&institution=KB"))).toEqual({
      institutionCode: "KB",
      kind: "error",
      reason: "denied",
    });
    expect(readLinkOutcome(params("link_error=state"))?.kind).toBe("error");
  });

  it("모르는 사유는 unknown 으로 묶는다 — 내부 코드를 그대로 보여주지 않는다", () => {
    expect(readLinkOutcome(params("link_error=weird"))).toMatchObject({
      reason: "unknown",
    });
  });

  it("결과가 없으면 null", () => {
    expect(readLinkOutcome(params("from=onboarding"))).toBeNull();
  });
});

describe("describeLinkOutcome", () => {
  it("받침에 맞는 조사를 붙인다", () => {
    expect(describeLinkOutcome({ institutionCode: "KB", kind: "linked" }, nameOf)).toBe(
      "KB국민은행을 연결했어요",
    );
    expect(
      describeLinkOutcome({ institutionCode: "TOSS", kind: "linked" }, nameOf),
    ).toBe("토스뱅크를 연결했어요");
  });

  it("만료는 다시 시작하라고 알린다", () => {
    expect(
      describeLinkOutcome(
        { institutionCode: null, kind: "error", reason: "state" },
        nameOf,
      ),
    ).toContain("다시 시도");
  });
});

describe("withObjectParticle", () => {
  it("한글로 끝나지 않으면 둘 다 적는다", () => {
    expect(withObjectParticle("iM")).toBe("iM을(를)");
  });
});

describe("connectableInstitutions", () => {
  it("이미 연결한 기관은 빼고, 대소문자를 가리지 않는다", () => {
    const rest = connectableInstitutions(["kb", "TOSS"]);
    expect(rest).not.toContain("KB");
    expect(rest).not.toContain("TOSS");
    expect(rest).toContain("SHINHAN");
  });
});

describe("startInstitutionLink", () => {
  beforeEach(() => mocked.mockReset());

  it("인가 주소를 돌려준다", async () => {
    mocked.mockResolvedValue({
      authorizeUrl: "http://localhost:3000/mydata/mock-consent?state=s",
    });
    await expect(startInstitutionLink("KB")).resolves.toContain("mock-consent");
  });

  it("http(s) 가 아닌 주소로는 보내지 않는다", async () => {
    // location 이동으로 javascript: 주소가 실행되면 안 된다.
    mocked.mockResolvedValue({ authorizeUrl: "javascript:alert(1)" });
    await expect(startInstitutionLink("KB")).rejects.toThrow();
  });

  it("주소가 없으면 실패로 본다", async () => {
    mocked.mockResolvedValue(null);
    await expect(startInstitutionLink("KB")).rejects.toThrow();
  });
});
