export function MobileAppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background shadow-sm">
      {children}
    </div>
  );
}
