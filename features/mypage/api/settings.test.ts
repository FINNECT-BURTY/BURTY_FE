import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/apiResponse", () => ({
  fetchApiData: vi.fn(),
  fetchApiList: vi.fn(),
}));

const { fetchApiData } = await import("@/shared/api/apiResponse");
const mocked = vi.mocked(fetchApiData);

const { unlinkInstitution } = await import("@/features/mypage/api/settings");

describe("unlinkInstitution", () => {
  beforeEach(() => mocked.mockReset());

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
