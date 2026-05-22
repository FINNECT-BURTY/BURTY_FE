"use client";

import Image from "next/image";
import { useState } from "react";

import { BottomNavigation } from "@/shared/layout/BottomNavigation";
import { MainHeader } from "@/shared/layout/MainHeader";
import { BottomActionButton } from "@/shared/ui/BottomActionButton";

type GrantCategory = "all" | "finance" | "housing" | "life";

type GrantProgram = Readonly<{
  category: Exclude<GrantCategory, "all">;
  deadline: string;
  description: string;
  title: string;
}>;

const categoryItems: readonly Readonly<{
  label: string;
  value: GrantCategory;
}>[] = [
  { label: "전체", value: "all" },
  { label: "주거", value: "housing" },
  { label: "금융", value: "finance" },
  { label: "생활비", value: "life" },
];

const grantPrograms: readonly GrantProgram[] = [
  {
    category: "housing",
    deadline: "마감 2026.04.23.",
    description: "청년 전세 자금 대출 이자 지원",
    title: "주거 지원",
  },
  {
    category: "finance",
    deadline: "마감 2026.04.23.",
    description: "청년 전세 자금 대출 이자 지원",
    title: "금융 지원",
  },
  {
    category: "life",
    deadline: "마감 2026.04.23.",
    description: "생활 안정 비용 지원",
    title: "생활비 지원",
  },
];

function getVisiblePrograms(category: GrantCategory) {
  if (category === "all") return grantPrograms;
  return grantPrograms.filter((program) => program.category === category);
}

export function GrantScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState<GrantCategory>("all");
  const visiblePrograms = getVisiblePrograms(selectedCategory);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <MainHeader />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7">
        <h1 className="text-title-md text-grayscale-1000">지원금 알아보기</h1>

        <article className="mt-4 bg-background px-5 py-5 rounded-2xl shadow-1">
          <h2 className="text-title-md text-grayscale-1000">
            3일 뒤 신청 마감되는 지원 정책이 있어요
          </h2>
          <p className="text-body-md mt-1 text-grayscale-1000">
            #주거지원&nbsp;&nbsp; #청년월세지원&nbsp;&nbsp; #월20만원
          </p>

          <div className="mt-4 overflow-hidden rounded-xl bg-yellow-100">
            <Image
              alt="2025 서울시 청년월세지원 안내 배너"
              className="h-auto w-full"
              height={151}
              priority
              src="/icons/grant/example-image.svg"
              width={286}
            />
          </div>

          <BottomActionButton className="mt-4" textStyle="title-sm">
            신청하기
          </BottomActionButton>
        </article>

        <section className="mt-4">
          <h2 className="text-title-md text-grayscale-1000">
            다른 지원 제도도 소개해 드릴게요
          </h2>

          <div className="mt-4 flex gap-2">
            {categoryItems.map((item) => {
              const isSelected = item.value === selectedCategory;

              return (
                <button
                  className={`text-body-md h-9 rounded-2xl border px-4 ${
                    isSelected
                      ? "border-grayscale-1000 bg-grayscale-1000 text-background"
                      : "border-grayscale-200 bg-background text-grayscale-800"
                  }`}
                  key={item.value}
                  onClick={() => setSelectedCategory(item.value)}
                  type="button"
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-4">
            {visiblePrograms.map((program) => (
              <article
                className="flex min-h-25 items-center justify-between gap-5 bg-background px-5 py-5 rounded-2xl border border-grayscale-100"
                key={`${program.category}-${program.title}`}
              >
                <div className="min-w-0">
                  <h3 className="text-body-lg text-grayscale-1000">
                    {program.title}
                  </h3>
                  <p className="text-caption text-grayscale-900">
                    {program.description}
                  </p>
                  <p className="text-caption mt-1 text-grayscale-800">
                    {program.deadline}
                  </p>
                </div>
                <button
                  className="text-body-md shrink-0 rounded-2xl bg-grayscale-1000 px-4 py-2 text-background"
                  type="button"
                >
                  신청하기
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>

      <BottomNavigation />
    </main>
  );
}
