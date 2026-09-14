import { FontScaleSync } from "@/shared/layout/FontScaleSync";

export function MobileAppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden overscroll-none bg-background shadow-sm">
      <FontScaleSync />
      {children}
    </div>
  );
}
