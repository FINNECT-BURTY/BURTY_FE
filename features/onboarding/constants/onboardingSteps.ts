export type OnboardingOption = Readonly<{
  label: string;
  value: string;
}>;

export type OnboardingOptions = readonly [
  OnboardingOption,
  ...OnboardingOption[],
];

export type OnboardingStep = Readonly<{
  id: string;
  title: string;
  description: string;
  options: OnboardingOptions;
}>;

export const ONBOARDING_STEPS = [
  {
    id: "situation",
    title: "현재 어떤 상황인가요?",
    description: "현재 상황에 맞는 금융 관리를 도와드릴게요.",
    options: [
      { label: "사회초년생", value: "early-career" },
      { label: "직장인", value: "employee" },
      { label: "프리랜서", value: "freelancer" },
      { label: "취업준비생", value: "job-seeker" },
    ],
  },
  {
    id: "incomeType",
    title: "수입 형태는 어떻게 되나요?",
    description: "정확한 자산 분석을 위해 수입원을 선택해주세요.",
    options: [
      { label: "월급", value: "salary" },
      { label: "프리랜서 수입", value: "freelance-income" },
      { label: "용돈", value: "allowance" },
      { label: "무소득", value: "no-income" },
    ],
  },
  {
    id: "rent",
    title: "월세를 내고 있나요?",
    description: "정확한 자산 분석을 위해 필요해요.",
    options: [
      { label: "네", value: "yes" },
      { label: "아니요", value: "no" },
    ],
  },
  {
    id: "loan",
    title: "대출이 있나요?",
    description: "정확한 한도 조회를 위해 정보를 입력해주세요.",
    options: [
      { label: "네", value: "yes" },
      { label: "아니요", value: "no" },
    ],
  },
] as const satisfies readonly OnboardingStep[];
