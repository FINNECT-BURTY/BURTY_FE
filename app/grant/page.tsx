import { GrantScreen } from "@/features/grant";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <GrantScreen />
    </MainRouteGuard>
  );
}
