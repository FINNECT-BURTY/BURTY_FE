import { SolutionResolveScreen } from "@/features/solution";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <SolutionResolveScreen />
    </MainRouteGuard>
  );
}
