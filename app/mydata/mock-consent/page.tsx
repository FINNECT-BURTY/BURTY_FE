import type { Metadata } from "next";
import { Suspense } from "react";

import { MockConsentScreen } from "@/features/mydata";
import { LoadingScreen } from "@/shared/layout/LoadingScreen";

// 검색 결과에 모의 인증 화면이 뜨면 실제 은행 화면으로 오해할 수 있다.
export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "모의 인증",
};

export default function Page() {
  // 쿼리를 읽는 화면이라 Suspense 로 감싼다. 감싸지 않으면 페이지 전체가 정적 생성에서 빠진다.
  return (
    <Suspense fallback={<LoadingScreen />}>
      <MockConsentScreen />
    </Suspense>
  );
}
