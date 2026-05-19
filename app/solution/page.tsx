import { MainPlaceholderScreen } from "@/shared/layout/MainPlaceholderScreen";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <MainPlaceholderScreen description="솔루션 화면" title="솔루션" />
    </MainRouteGuard>
  );
}
