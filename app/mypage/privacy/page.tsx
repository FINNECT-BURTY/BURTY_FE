import { PrivacyScreen } from "@/features/privacy";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <PrivacyScreen />
    </MainRouteGuard>
  );
}
