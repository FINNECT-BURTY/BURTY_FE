import {
  agreementContents,
  type AgreementId,
  agreementItems,
} from "@/features/onboarding";

export type TermsDocument = Readonly<{
  id: AgreementId;
  title: string;
  content: string;
  required: boolean;
}>;

/**
 * 가입할 때 동의한 약관·정책 문서.
 *
 * <p>온보딩과 같은 원문을 쓴다. 두 곳에 따로 두면 한쪽만 고쳐져 사용자가 동의한 내용과
 * 보여주는 내용이 갈라진다.
 *
 * <p>제목에서 (필수)/(선택) 표시는 뗀다. 여기는 동의를 받는 자리가 아니라 이미 동의한
 * 내용을 열람하는 자리다.
 */
export function termsDocuments(): readonly TermsDocument[] {
  return agreementItems.map((item) => ({
    content: agreementContents[item.id],
    id: item.id,
    required: item.required,
    title: item.label.replace(/^\((필수|선택)\)\s*/, ""),
  }));
}
