import { FixedExpenseScreen } from "@/features/mypage";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <FixedExpenseScreen />
    </MainRouteGuard>
  );
}
