"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

type RiskForecastCardProps = Readonly<{
  title: string;
  subtitle: string;
  href?: string;
}>;

export function RiskMiniChart() {
  return (
    <div className="mt-7">
      <svg
        aria-hidden="true"
        className="h-[130px] w-full"
        preserveAspectRatio="none"
        viewBox="0 0 280 130"
      >
        <defs>
          <linearGradient id="risk-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f4dc70" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#f4dc70" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path
          d="M0 78 C42 47 88 28 124 50 C158 71 157 103 194 88 C232 72 250 51 280 14 L280 112 L0 112 Z"
          fill="url(#risk-fill)"
        />
        <path
          d="M0 78 C42 47 88 28 124 50 C158 71 157 103 194 88 C232 72 250 51 280 14"
          fill="none"
          stroke="#f4dc70"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <line
          stroke="#f4dc70"
          strokeDasharray="4 4"
          strokeLinecap="round"
          strokeWidth="2"
          x1="185"
          x2="185"
          y1="64"
          y2="88"
        />
        <circle cx="185" cy="88" fill="#f4dc70" r="4" />
        <text fill="#474747" fontSize="11" x="152" y="50">
          위험 예상 발생
        </text>
      </svg>
      <div className="text-caption mt-1 grid grid-cols-4 text-center text-grayscale-700">
        <span>10일</span>
        <span>20일</span>
        <span className="text-grayscale-1000">25일</span>
        <span>30일</span>
      </div>
    </div>
  );
}

export function RiskForecastCard({ title, subtitle, href }: RiskForecastCardProps) {
  const content = (
    <section className="rounded-2xl border border-grayscale-100 bg-background p-5 shadow-[0_2px_12px_rgba(30,30,30,0.04)]">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-title-md text-grayscale-1000">{title}</h2>
          <p className="text-body-md mt-1 text-grayscale-800">{subtitle}</p>
        </div>
        {href ? (
          <ChevronRight
            aria-hidden="true"
            className="mt-1 shrink-0 text-grayscale-900"
            size={24}
            strokeWidth={1.8}
          />
        ) : null}
      </div>
      <RiskMiniChart />
    </section>
  );

  if (!href) return content;
  return (
    <Link aria-label="위험 상세 보기" href={href}>
      {content}
    </Link>
  );
}
