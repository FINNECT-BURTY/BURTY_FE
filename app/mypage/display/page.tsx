import { DisplaySettingsScreen } from "@/features/mypage/components/DisplaySettingsScreen";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <DisplaySettingsScreen />
    </MainRouteGuard>
  );
}
