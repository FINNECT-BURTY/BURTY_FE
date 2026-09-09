import { describe, expect, it } from "vitest";

import { toExportSections } from "@/features/privacy/api/privacy";

describe("toExportSections", () => {
  it("아는 키에 한글 이름을 붙인다", () => {
    const sections = toExportSections({ account: { status: "ACTIVE" } });
    expect(sections[0]?.label).toBe("계정");
  });

  it("모르는 키를 숨기지 않는다", () => {
    // 열람권은 보유한 정보를 빠짐없이 보여주는 것이 목적이다. 라벨을 못 붙였다고
    // 빼면 사용자는 그 정보가 있는지조차 알 수 없다.
    const sections = toExportSections({ someNewField: { a: 1 } });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.label).toBe("someNewField");
  });

  it("빈 배열 구획은 보여주지 않는다", () => {
    // 연결된 기관이 없는 사용자에게 빈 "연결된 기관" 칸은 정보가 아니라 잡음이다.
    const sections = toExportSections({ devices: [], linkedInstitutions: [] });
    expect(sections).toHaveLength(0);
  });

  it("null 구획은 보여주지 않는다", () => {
    expect(toExportSections({ erasure: null })).toHaveLength(0);
  });

  it("0 과 false 는 값이므로 남긴다", () => {
    // 거래 건수 0 건은 "정보 없음" 이 아니라 "0 건" 이라는 정보다.
    const sections = toExportSections({ count: 0, flag: false });
    expect(sections).toHaveLength(2);
  });

  it("응답이 없으면 빈 목록이다", () => {
    expect(toExportSections(null)).toEqual([]);
  });
});
