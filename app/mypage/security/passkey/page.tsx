import { PasskeyRegisterScreen } from "@/features/security";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <PasskeyRegisterScreen />
    </MainRouteGuard>
  );
}
