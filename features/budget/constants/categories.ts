/**
 * 예산을 걸 수 있는 지출 카테고리.
 *
 * <p>거래 카테고리 전체가 아니라 지출만 고른다. 급여·이자 같은 수입 항목에
 * 예산을 거는 것은 뜻이 통하지 않는다.
 */
export const BUDGET_CATEGORIES = [
  { code: "", label: "전체" },
  { code: "FOOD", label: "식비" },
  { code: "CAFE", label: "카페" },
  { code: "GROCERY", label: "장보기" },
  { code: "CONVENIENCE", label: "편의점" },
  { code: "TRANSPORT", label: "교통" },
  { code: "SHOPPING", label: "쇼핑" },
  { code: "HEALTH", label: "의료" },
  { code: "HOUSING", label: "주거" },
  { code: "CULTURE", label: "문화" },
  { code: "EDUCATION", label: "교육" },
  { code: "SUBSCRIPTION", label: "구독" },
] as const;
