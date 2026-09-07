import { FamilyProtectionScreen } from "@/features/family";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <FamilyProtectionScreen />
    </MainRouteGuard>
  );
}
