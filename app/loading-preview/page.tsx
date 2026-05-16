import { LoadingScreen } from "@/shared/layout/LoadingScreen";

export default function Page() {
  return (
    <LoadingScreen
      description={"월세, 카드값, 대출 일정을 확인해\n위험 구간을 찾고 있어요"}
      title="돈 흐름을 분석하고 있어요"
    />
  );
}
