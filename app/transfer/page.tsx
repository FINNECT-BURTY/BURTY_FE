import { TransferScreen } from "@/features/transfer";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <TransferScreen />
    </MainRouteGuard>
  );
}
