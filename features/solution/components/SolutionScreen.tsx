"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { BottomNavigation } from "@/shared/layout/BottomNavigation";
import { MainHeader } from "@/shared/layout/MainHeader";
import { BottomActionButton } from "@/shared/ui/BottomActionButton";

type AlternativeSolution = Readonly<{
  description: string;
  title: string;
}>;

const alternativeSolutions: readonly AlternativeSolution[] = [
  {
    description: "목돈을 아낄 수 있어요",
    title: "결제일 변경하기",
  },
  {
    description: "예상치 못한 지출을 막을 수 있어요",
    title: "비상금 분리하기",
  },
  {
    description: "나에게 가장 유리한 순서로 대출을 갚아요",
    title: "상환 우선순위 조정하기",
  },
];

export function SolutionScreen() {
  const router = useRouter();

  const handleResolve = () => {
    router.push("/solution/resolve");
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <MainHeader />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7">
        <h1 className="text-title-md text-grayscale-1000">솔루션</h1>

        <article className="mt-4 bg-background px-5 py-5 rounded-2xl shadow-1">
          <h2 className="text-title-md text-grayscale-1000">
            00님 지금 필요한 솔루션이 있어요
          </h2>
          <p className="text-body-md mt-1 text-grayscale-900">
            50,000원을 확보할 수 있어요
          </p>

          <div className="mt-8 flex justify-center">
            <Image
              alt=""
              aria-hidden="true"
              height={140}
              priority
              src="/icons/solution/food.svg"
              width={140}
            />
          </div>

          <BottomActionButton
            className="mt-8"
            onClick={handleResolve}
            textStyle="title-sm"
          >
            지금 해결하기
          </BottomActionButton>
        </article>

        <section className="mt-6">
          <h2 className="text-title-md text-grayscale-1000">다른 방법도 있어요</h2>

          <div className="mt-4 space-y-4">
            {alternativeSolutions.map((solution) => (
              <button
                className="flex min-h-25 w-full items-center justify-between bg-background px-5 py-5 text-left rounded-2xl border border-grayscale-100"
                key={solution.title}
                type="button"
              >
                <span className="min-w-0">
                  <span className="text-title-sm block text-grayscale-1000">
                    {solution.title}
                  </span>
                  <span className="text-body-md mt-1 block text-grayscale-900">
                    {solution.description}
                  </span>
                </span>
                <Image
                  alt=""
                  aria-hidden="true"
                  className="shrink-0"
                  height={17}
                  src="/icons/finance/right-arrow-gray-800.svg"
                  width={12}
                />
              </button>
            ))}
          </div>
        </section>
      </section>

      <BottomNavigation />
    </main>
  );
}
