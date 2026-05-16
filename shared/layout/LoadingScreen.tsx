type LoadingScreenProps = Readonly<{
  title: string;
  description: string;
}>;

export function LoadingScreen({ title, description }: LoadingScreenProps) {
  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <section
        aria-busy="true"
        aria-live="polite"
        className="flex flex-1 flex-col items-center justify-center px-8 text-center"
        role="status"
      >
        <div
          aria-hidden="true"
          className="animate-loading-spin size-40 rounded-full bg-[conic-gradient(var(--yellow-400)_0deg_225deg,var(--grayscale-100)_225deg_360deg)] p-[14px]"
        >
          <div className="size-full rounded-full bg-background" />
        </div>

        <h1 className="text-title-lg mt-14 text-grayscale-1000">{title}</h1>
        <p className="text-body-lg mt-3 whitespace-pre-line text-grayscale-800">
          {description}
        </p>
      </section>
    </main>
  );
}
