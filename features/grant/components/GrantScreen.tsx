"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import {
  fetchYouthPolicies,
  type YouthPolicyDomain,
  type YouthPolicySummary,
} from "@/features/grant/api/youthPolicy";
import {
  extractHashtags,
  formatPolicyDateKor,
  getDaysUntil,
  pickFeaturedPolicy,
  resolvePolicyUrl,
} from "@/features/grant/lib/policyHelpers";
import { BottomNavigation } from "@/shared/layout/BottomNavigation";
import { LoadingScreen } from "@/shared/layout/LoadingScreen";
import { MainHeader } from "@/shared/layout/MainHeader";
import { BottomActionButton } from "@/shared/ui/BottomActionButton";

type CategoryFilter = "all" | YouthPolicyDomain;

const categoryItems: readonly Readonly<{
  label: string;
  value: CategoryFilter;
}>[] = [
  { label: "전체", value: "all" },
  { label: "주거", value: "housing" },
  { label: "금융", value: "finance" },
  { label: "복지", value: "welfare" },
  { label: "지원금", value: "subsidy" },
];

const FEATURED_HEADLINE_FALLBACK = "지금 신청 가능한 지원 정책이 있어요";
const LIST_PAGE_SIZE = 30;
const ALL_FETCH_SIZE = 50;

function buildFeaturedHeadline(daysUntilDeadline: number | null): string {
  if (daysUntilDeadline === null) return FEATURED_HEADLINE_FALLBACK;
  if (daysUntilDeadline <= 0) return "오늘 신청 마감되는 지원 정책이 있어요";
  return `${daysUntilDeadline}일 뒤 신청 마감되는 지원 정책이 있어요`;
}

function openExternalUrl(url: string) {
  if (typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer");
}

type PoliciesByCategory = Partial<
  Record<CategoryFilter, readonly YouthPolicySummary[]>
>;

export function GrantScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("all");
  const [policiesByCategory, setPoliciesByCategory] =
    useState<PoliciesByCategory>({});
  const [featured, setFeatured] = useState<YouthPolicySummary | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      const data = await fetchYouthPolicies({ size: ALL_FETCH_SIZE });
      if (!mounted) return;

      setPoliciesByCategory((prev) => ({ ...prev, all: data }));
      setFeatured(pickFeaturedPolicy(data));
      setIsInitialLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") return;
    if (policiesByCategory[selectedCategory]) return;

    let mounted = true;

    void (async () => {
      setIsCategoryLoading(true);
      const data = await fetchYouthPolicies({
        domain: selectedCategory,
        size: LIST_PAGE_SIZE,
      });
      if (!mounted) return;

      setPoliciesByCategory((prev) => ({ ...prev, [selectedCategory]: data }));
      setIsCategoryLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [selectedCategory, policiesByCategory]);

  const visiblePolicies = policiesByCategory[selectedCategory] ?? [];
  const isListLoading = selectedCategory === "all"
    ? isInitialLoading
    : isCategoryLoading;

  const featuredHashtags = useMemo(
    () => (featured ? extractHashtags(featured) : []),
    [featured],
  );
  const featuredDaysUntilDeadline = featured
    ? getDaysUntil(featured.endDate)
    : null;
  const featuredUrl = featured ? resolvePolicyUrl(featured) : null;

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <MainHeader />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7">
        <h1 className="text-title-md text-grayscale-1000">지원금 알아보기</h1>

        {featured ? (
          <article className="mt-4 bg-background px-5 py-5 rounded-2xl shadow-1">
            <h2 className="text-title-md text-grayscale-1000">
              {buildFeaturedHeadline(featuredDaysUntilDeadline)}
            </h2>
            <p className="text-body-md mt-1 line-clamp-2 text-grayscale-1000">
              {featured.title}
            </p>
            {featuredHashtags.length > 0 ? (
              <p className="text-body-md mt-1 text-grayscale-900">
                {featuredHashtags.map((tag) => `#${tag}`).join("   ")}
              </p>
            ) : null}

            <div
              aria-hidden="true"
              className="mt-4 flex aspect-[286/151] w-full items-center justify-center overflow-hidden rounded-xl bg-yellow-100"
            >
              <Image
                alt=""
                aria-hidden="true"
                className="h-30 w-30"
                height={100}
                src="/icons/grant/grant.svg"
                width={100}
              />
            </div>

            <BottomActionButton
              className="mt-4"
              disabled={!featuredUrl}
              onClick={() => {
                if (featuredUrl) openExternalUrl(featuredUrl);
              }}
              textStyle="title-sm"
            >
              신청하기
            </BottomActionButton>
          </article>
        ) : null}

        <section className="mt-6">
          <h2 className="text-title-md text-grayscale-1000">
            다른 지원 제도도 소개해 드릴게요
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
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
            {isListLoading && visiblePolicies.length === 0 ? (
              <div
                aria-busy="true"
                aria-live="polite"
                className="flex justify-center py-12"
                role="status"
              >
                <div
                  aria-hidden="true"
                  className="animate-loading-spin size-10 rounded-full bg-[conic-gradient(var(--yellow-400)_0deg_225deg,var(--grayscale-100)_225deg_360deg)] p-[5px]"
                >
                  <div className="size-full rounded-full bg-main-background" />
                </div>
                <span className="sr-only">지원 정책을 불러오는 중이에요</span>
              </div>
            ) : null}

            {!isListLoading && visiblePolicies.length === 0 ? (
              <p className="text-body-md py-8 text-center text-grayscale-700">
                해당 카테고리의 지원 정책이 없어요.
              </p>
            ) : null}

            {visiblePolicies.map((policy) => {
              const deadline = formatPolicyDateKor(policy.endDate);
              const url = resolvePolicyUrl(policy);

              return (
                <article
                  className="flex min-h-25 items-center justify-between gap-5 bg-background px-5 py-5 rounded-2xl border border-grayscale-100"
                  key={policy.id}
                >
                  <div className="min-w-0">
                    <h3 className="text-title-sm line-clamp-2 text-grayscale-1000">
                      {policy.title}
                    </h3>
                    {policy.subCategory ? (
                      <p className="text-caption mt-1 text-grayscale-900">
                        {policy.subCategory}
                      </p>
                    ) : null}
                    {deadline ? (
                      <p className="text-caption mt-1 text-grayscale-800">
                        마감 {deadline}
                      </p>
                    ) : null}
                  </div>
                  <button
                    className="text-body-md shrink-0 rounded-2xl bg-grayscale-1000 px-4 py-2 text-background disabled:bg-grayscale-200 disabled:text-grayscale-400"
                    disabled={!url}
                    onClick={() => {
                      if (url) openExternalUrl(url);
                    }}
                    type="button"
                  >
                    신청하기
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </section>

      <BottomNavigation />
    </main>
  );
}
