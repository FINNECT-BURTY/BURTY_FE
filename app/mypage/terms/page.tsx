import { TermsScreen } from "@/features/mypage/components/TermsScreen";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <TermsScreen />
    </MainRouteGuard>
  );
}
