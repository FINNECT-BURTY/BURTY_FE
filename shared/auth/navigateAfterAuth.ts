import { markSkipStartupSplash } from "@/shared/layout/startupSplash";

type AuthRouter = Readonly<{
  replace: (href: string) => void;
}>;

export function navigateAfterAuth(router: AuthRouter, destination: string) {
  if (destination === "/") {
    markSkipStartupSplash();
  }

  router.replace(destination);
}
