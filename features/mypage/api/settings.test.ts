import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/apiResponse", () => ({
  fetchApiData: vi.fn(),
  fetchApiList: vi.fn(),
}));

vi.mock("@/features/security/api/stepUp", () => ({
  stepUpWithBiometrics: vi.fn(),
}));

const { fetchApiData, fetchApiList } = await import("@/shared/api/apiResponse");
const { stepUpWithBiometrics } = await import("@/features/security/api/stepUp");
const mocked = vi.mocked(fetchApiData);
const mockedList = vi.mocked(fetchApiList);
const mockedStepUp = vi.mocked(stepUpWithBiometrics);

const { fetchSecurity, revokeAllSessions, revokeSession, unlinkInstitution } =
  await import("@/features/mypage/api/settings");

beforeEach(() => {
  mocked.mockReset();
  mockedList.mockReset();
  mockedStepUp.mockReset();
});

describe("unlinkInstitution", () => {
  it("LEVEL_2 증명을 받아 X-Risk-Proof 로 보낸다", async () => {
    // 증명 없이 보내면 백엔드가 403 으로 막는다. 화면에서 해제가 한 번도 되지 않았다.
    mocked.mockResolvedValueOnce({ riskProof: "proof-1" }).mockResolvedValueOnce(true);

    await unlinkInstitution("KB");

    expect(mocked).toHaveBeenNthCalledWith(1, "/api/v1/security/level2/proof", {
      method: "POST",
    });
    expect(mocked).toHaveBeenNthCalledWith(2, "/api/v1/mydata/institutions/KB", {
      headers: { "X-Risk-Proof": "proof-1" },
      method: "DELETE",
    });
  });

  it("증명을 받지 못하면 해제 요청을 보내지 않는다", async () => {
    mocked.mockResolvedValueOnce(null);

    await expect(unlinkInstitution("KB")).rejects.toThrow();
    expect(mocked).toHaveBeenCalledTimes(1);
  });
});

/**
 * 보안 설정의 세션 관리.
 *
 * <p>세션 조회·해제는 LEVEL_2, 모든 기기 로그아웃은 LEVEL_3 다. 예전에는 증명 없이 불러
 * 목록은 항상 비어 보였고 "모든 기기에서 로그아웃" 은 항상 실패했다 (#155).
 */
describe("보안 설정 세션", () => {
  it("세션 목록은 LEVEL_2 증명을 실어 조회한다", async () => {
    mocked.mockResolvedValueOnce({ riskProof: "proof-2" });
    mockedList.mockResolvedValue([]);

    await fetchSecurity();

    expect(mockedList).toHaveBeenCalledWith("/api/v1/sessions", {
      headers: { "X-Risk-Proof": "proof-2" },
    });
  });

  it("세션 하나 끊기는 LEVEL_2 증명을 싣는다", async () => {
    mocked.mockResolvedValueOnce({ riskProof: "proof-2" }).mockResolvedValueOnce(true);

    await revokeSession("s-1");

    expect(mocked).toHaveBeenNthCalledWith(2, "/api/v1/sessions/s-1", {
      headers: { "X-Risk-Proof": "proof-2" },
      method: "DELETE",
    });
  });

  it("모든 기기 로그아웃은 생체 단계 인증(LEVEL_3)을 거쳐 그 증명을 싣는다", async () => {
    mockedStepUp.mockResolvedValueOnce({ assertionToken: "a", riskProof: "proof-3" });
    mocked.mockResolvedValueOnce(true);

    await revokeAllSessions("7");

    expect(mockedStepUp).toHaveBeenCalledWith("7");
    expect(mocked).toHaveBeenCalledWith("/api/v1/sessions", {
      headers: { "X-Risk-Proof": "proof-3" },
      method: "DELETE",
    });
  });

  it("생체 단계 인증이 실패하면 로그아웃 요청을 보내지 않는다", async () => {
    mockedStepUp.mockRejectedValueOnce(new Error("rejected"));

    await expect(revokeAllSessions("7")).rejects.toThrow();
    expect(mocked).not.toHaveBeenCalled();
  });
});
