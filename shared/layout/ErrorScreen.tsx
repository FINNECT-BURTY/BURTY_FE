"use client";

import Image from "next/image";
import Link from "next/link";

import { BottomActionButton } from "@/shared/ui/BottomActionButton";

type ErrorScreenProps = Readonly<{
  headerTitle: string;
  title: string;
  description: string;
  retryLabel: string;
  homeLabel: string;
  homeHref?: string;
  onBack?: () => void;
  onRetry: () => void;
}>;

export function ErrorScreen({
  headerTitle,
  title,
  description,
  retryLabel,
  homeLabel,
  homeHref = "/",
  onBack,
  onRetry,
}: ErrorScreenProps) {
  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background text-grayscale-1000">
      <header className="relative flex h-16 shrink-0 items-center justify-center px-6">
        {onBack ? (
          <button
            aria-label="뒤로가기"
            className="absolute left-6 flex size-10 items-center justify-center text-grayscale-1000"
            onClick={onBack}
            type="button"
          >
            <Image
              alt=""
              aria-hidden="true"
              height={24}
              src="/icons/header/back-arrow.svg"
              width={24}
            />
          </button>
        ) : null}
        <h1 className="text-title-md text-grayscale-1000">{headerTitle}</h1>
      </header>

      <section className="flex flex-1 flex-col items-center px-7 pt-32 text-center">
        <div
          aria-hidden="true"
          className="flex size-[72px] items-center justify-center rounded-full bg-yellow-400 text-[42px] font-bold leading-none text-background"
        >
          !
        </div>

        <h2 className="text-title-lg mt-9 text-grayscale-1000">{title}</h2>
        <p className="text-body-lg mt-3 whitespace-pre-line text-grayscale-800">
          {description}
        </p>

        <BottomActionButton className="mt-16 px-6" onClick={onRetry}>
          {retryLabel}
        </BottomActionButton>

        <Link
          className="text-body-md mt-7 text-grayscale-1000"
          href={homeHref}
        >
          {homeLabel}
        </Link>
      </section>
    </main>
  );
}
