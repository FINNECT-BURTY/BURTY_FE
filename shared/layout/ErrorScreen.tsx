"use client";

import Link from "next/link";

import { Header, HeaderBackButton } from "@/shared/layout/Header";
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
      <Header
        leftSlot={onBack ? <HeaderBackButton onClick={onBack} /> : null}
        title={headerTitle}
      />

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
