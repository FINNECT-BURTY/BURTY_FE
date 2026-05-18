"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentAuthUser } from "@/shared/api/authSession";
import { LoadingScreen } from "@/shared/layout/LoadingScreen";

type ProtectedRouteProps = Readonly<{
  children: React.ReactNode;
}>;

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let active = true;

    getCurrentAuthUser()
      .then((user) => {
        if (!active) return;
        if (!user) {
          const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
          router.replace(`/onboarding${next}`);
          return;
        }
        if (!user.profileComplete) {
          router.replace(
            "/onboarding?newUser=false&profileComplete=false&step=profile",
          );
          return;
        }
        setVerified(true);
      })
      .catch(() => {
        if (!active) return;
        const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
        router.replace(`/onboarding${next}`);
      });

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (!verified) {
    return (
      <LoadingScreen
        description="잠시만 기다려 주세요"
        title="로그인 상태를 확인하고 있어요"
      />
    );
  }

  return children;
}
