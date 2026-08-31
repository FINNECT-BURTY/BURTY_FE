import { TransactionScreen } from "@/features/transaction";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <TransactionScreen />
    </MainRouteGuard>
  );
}
