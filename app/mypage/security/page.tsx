import { SecurityScreen } from "@/features/mypage";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <SecurityScreen />
    </MainRouteGuard>
  );
}
