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
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
      <MainHeader />

      <section className="min-h-0 flex-1 overflow-y-auto bg-grayscale-100 px-6 py-6">
        <div className="rounded-lg border border-grayscale-200 bg-background px-5 py-5">
          <h1 className="text-title-lg text-grayscale-1000">
            {title}
          </h1>
          <p className="text-body-md mt-2 text-grayscale-900">
            {description}
          </p>
        </div>
      </section>

      <BottomNavigation />
    </main>
  );
}
