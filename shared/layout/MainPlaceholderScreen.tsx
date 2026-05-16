import { BottomNavigation } from "@/shared/layout/BottomNavigation";
import { MainHeader } from "@/shared/layout/MainHeader";

type MainPlaceholderScreenProps = Readonly<{
  title: string;
  description: string;
}>;

export function MainPlaceholderScreen({
  title,
  description,
}: MainPlaceholderScreenProps) {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
      <MainHeader />

      <section className="min-h-0 flex-1 overflow-y-auto bg-sub-background px-6 py-6">
        <div className="rounded-lg border border-border bg-background px-5 py-5">
          <h1 className="text-xl font-semibold leading-7 text-primary">
            {title}
          </h1>
          <p className="mt-2 text-sm font-medium text-sub-foreground">
            {description}
          </p>
        </div>
      </section>

      <BottomNavigation />
    </main>
  );
}
