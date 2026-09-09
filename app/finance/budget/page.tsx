import { BudgetScreen } from "@/features/budget";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <BudgetScreen />
    </MainRouteGuard>
  );
}
