import { HomeScreen } from "@/features/home";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <HomeScreen />
    </MainRouteGuard>
  );
}
