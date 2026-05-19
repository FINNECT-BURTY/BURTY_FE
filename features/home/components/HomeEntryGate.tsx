import { HomeScreen } from "@/features/home/components/HomeScreen";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export function HomeEntryGate() {
  return (
    <MainRouteGuard>
      <HomeScreen />
    </MainRouteGuard>
  );
}
