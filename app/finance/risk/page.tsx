import { RiskDetailScreen } from "@/features/finance";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <RiskDetailScreen />
    </MainRouteGuard>
  );
}
