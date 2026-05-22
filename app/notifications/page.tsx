import { NotificationScreen } from "@/features/notification";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <NotificationScreen />
    </MainRouteGuard>
  );
}
