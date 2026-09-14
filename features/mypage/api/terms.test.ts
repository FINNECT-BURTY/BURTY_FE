import { describe, expect, it } from "vitest";

import { termsDocuments } from "@/features/mypage/api/terms";
import { agreementItems } from "@/features/onboarding";

/**
 * 가입 후 약관 열람.
 *
 * <p>온보딩에서 동의한 항목과 열람 화면의 목록이 갈라지면, 사용자는 자기가 무엇에
 * 동의했는지 확인할 수 없다.
 */
describe("termsDocuments", () => {
  it("동의 항목과 같은 문서를 같은 순서로 준다", () => {
    expect(termsDocuments().map((doc) => doc.id)).toEqual(
      agreementItems.map((item) => item.id),
    );
  });

  it("모든 문서에 원문이 있다", () => {
    // 항목만 있고 원문이 비어 있으면 화면이 빈 페이지를 보여준다.
    for (const doc of termsDocuments()) {
      expect(doc.content.trim().length).toBeGreaterThan(100);
    }
  });

  it("제목에서 (필수)/(선택) 표시를 뗀다", () => {
    for (const doc of termsDocuments()) {
      expect(doc.title).not.toContain("(필수)");
      expect(doc.title).not.toContain("(선택)");
      expect(doc.title.trim().length).toBeGreaterThan(0);
    }
  });

  it("필수 여부는 그대로 전달한다", () => {
    // 어떤 것이 필수였는지는 열람 화면에서도 구분해 보여줘야 한다.
    const required = termsDocuments().filter((doc) => doc.required);
    expect(required.length).toBe(agreementItems.filter((i) => i.required).length);
  });
});
