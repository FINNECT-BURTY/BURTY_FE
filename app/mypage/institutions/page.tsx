import { Suspense } from "react";

import { LinkedInstitutionsScreen } from "@/features/mypage";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard>
      <Suspense fallback={null}>
        <LinkedInstitutionsScreen />
      </Suspense>
    </MainRouteGuard>
  );
}
