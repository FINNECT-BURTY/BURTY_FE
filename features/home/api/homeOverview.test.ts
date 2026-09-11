import { describe, expect, it } from "vitest";

import { type AssetSummary, describeAssetState } from "@/features/home/api/homeOverview";

const summary = (overrides: Partial<AssetSummary> = {}): AssetSummary => ({
  monthlySpend: 0,
  totalAsset: 0,
  volatilityPercent: 0,
  ...overrides,
});

describe("describeAssetState", () => {
  it("연결이 없으면 0원이 아니라 미연동이다", () => {
    expect(describeAssetState(summary({ linkedInstitutionCount: 0 }))).toEqual({
      kind: "unlinked",
    });
  });

  it("일부 기관이 빠졌으면 알린다", () => {
    expect(
      describeAssetState(summary({ failedInstitutionCount: 1, linkedInstitutionCount: 2 })),
    ).toEqual({ kind: "linked", partial: true });
  });

  it("연동 수를 주지 않는 옛 응답은 연결된 것으로 본다", () => {
    expect(describeAssetState(summary())).toEqual({ kind: "linked", partial: false });
  });

  it("요청이 실패했으면 모름이다", () => {
    expect(describeAssetState(null)).toEqual({ kind: "unknown" });
  });
});
