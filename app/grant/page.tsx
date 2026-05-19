import { MainPlaceholderScreen } from "@/shared/layout/MainPlaceholderScreen";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <MainPlaceholderScreen description="지원금 화면" title="지원금" />
    </MainRouteGuard>
  );
}
