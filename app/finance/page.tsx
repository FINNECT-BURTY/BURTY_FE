import { MainPlaceholderScreen } from "@/shared/layout/MainPlaceholderScreen";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <MainPlaceholderScreen description="자산 화면" title="자산" />
    </MainRouteGuard>
  );
}
