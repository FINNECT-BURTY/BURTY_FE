import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/apiResponse", () => ({
  fetchApiData: vi.fn(),
  fetchApiList: vi.fn(),
}));

const { fetchApiData } = await import("@/shared/api/apiResponse");
const mocked = vi.mocked(fetchApiData);

const { executeAction } = await import("@/features/solution/api/solution");

/**
 * 추천 행동 실행은 LEVEL_2 다.
 *
 * <p>예전에는 증명 없이 보내 403 으로 막혔고, 화면에는 로그인이 끊긴 것처럼 보였다 (#155).
 */
describe("executeAction", () => {
  beforeEach(() => mocked.mockReset());

  it("LEVEL_2 증명을 받아 X-Risk-Proof 로 보낸다", async () => {
    mocked
      .mockResolvedValueOnce({ riskProof: "proof-2" })
      .mockResolvedValueOnce({ actionType: "SAVE", executed: true });

    await executeAction("SAVE");

    expect(mocked).toHaveBeenNthCalledWith(1, "/api/v1/security/level2/proof", {
      method: "POST",
    });
    expect(mocked).toHaveBeenNthCalledWith(2, "/api/v1/cashflow/action/execute", {
      body: JSON.stringify({ actionType: "SAVE" }),
      headers: { "Content-Type": "application/json", "X-Risk-Proof": "proof-2" },
      method: "POST",
    });
  });

  it("증명을 받지 못하면 실행 요청을 보내지 않는다", async () => {
    mocked.mockResolvedValueOnce(null);

    await expect(executeAction("SAVE")).rejects.toThrow();
    expect(mocked).toHaveBeenCalledTimes(1);
  });
});
