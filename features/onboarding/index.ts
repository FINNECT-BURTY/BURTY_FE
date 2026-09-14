export { OnboardingFlow } from "@/features/onboarding/components/OnboardingFlow";
// 약관 원문과 렌더러는 마이페이지의 약관 화면도 쓴다. 같은 내용을 두 곳에 두면 갈라진다.
export {
  agreementContents,
  type AgreementId,
  type AgreementItem,
  agreementItems,
} from "@/features/onboarding/constants/agreements";
export { AgreementMarkdown } from "@/features/onboarding/ui/AgreementMarkdown";
