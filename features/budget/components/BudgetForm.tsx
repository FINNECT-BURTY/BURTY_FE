"use client";

import { useState } from "react";

import type { BudgetStatus } from "@/features/budget/api/budgets";
import { BUDGET_CATEGORIES } from "@/features/budget/constants/categories";

const DEFAULT_THRESHOLD = 80;
/** 백엔드 `@Positive` 와 맞춘다. 서버가 거절할 값을 보내지 않는다. */
const MIN_AMOUNT = 1;

export type BudgetFormValue = Readonly<{
  alertThresholdPercent: number;
  amount: number;
  categoryCode: string;
}>;

/**
 * 예산 설정 폼.
 *
 * <p>금액은 문자열로 들고 있다가 제출할 때만 숫자로 바꾼다. 입력 중에 숫자로
 * 바꾸면 지우다 빈 칸이 된 순간 0 이 되어 커서가 튄다.
 */
export function BudgetForm({
  editing,
  isSubmitting,
  onCancel,
  onSubmit,
  takenCategories,
}: Readonly<{
  /** 수정 중인 예산. 없으면 새로 만드는 중이다. */
  editing: BudgetStatus | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (value: BudgetFormValue) => void;
  /** 이미 예산이 있는 카테고리. 새로 만들 때는 고르지 못하게 한다. */
  takenCategories: readonly string[];
}>) {
  const [categoryCode, setCategoryCode] = useState(
    editing?.categoryCode ?? "",
  );
  const [amountText, setAmountText] = useState(
    editing ? String(editing.budgetAmount) : "",
  );
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);

  const amount = Number(amountText.replace(/[^0-9]/g, ""));
  const isAmountValid = Number.isFinite(amount) && amount >= MIN_AMOUNT;

  const options = BUDGET_CATEGORIES.filter(
    (option) =>
      // 수정 중인 항목의 카테고리는 남겨둔다. 없애면 자기 자신을 못 고른다.
      option.code === editing?.categoryCode ||
      !takenCategories.includes(option.code),
  );

  const handleSubmit = () => {
    if (!isAmountValid || isSubmitting) return;
    onSubmit({ alertThresholdPercent: threshold, amount, categoryCode });
  };

  return (
    <section className="rounded-2xl border border-grayscale-100 bg-background px-5 py-5">
      <h2 className="text-title-sm text-grayscale-1000">
        {editing ? `${budgetName(editing)} 예산 수정` : "예산 추가"}
      </h2>

      {editing ? null : (
        <>
          <label
            className="text-caption mt-4 block text-grayscale-700"
            htmlFor="budget-category"
          >
            카테고리
          </label>
          <select
            className="text-body-lg mt-1 h-12 w-full rounded-xl border border-grayscale-200 bg-background px-3 text-grayscale-1000"
            id="budget-category"
            onChange={(event) => setCategoryCode(event.target.value)}
            value={categoryCode}
          >
            {options.map((option) => (
              <option key={option.code || "TOTAL"} value={option.code}>
                {option.code ? option.label : "전체 예산"}
              </option>
            ))}
          </select>
        </>
      )}

      <label
        className="text-caption mt-4 block text-grayscale-700"
        htmlFor="budget-amount"
      >
        한 달 예산
      </label>
      <div className="mt-1 flex items-center gap-2">
        <input
          className="text-body-lg h-12 min-w-0 flex-1 rounded-xl border border-grayscale-200 bg-background px-3 text-right text-grayscale-1000"
          id="budget-amount"
          inputMode="numeric"
          onChange={(event) => setAmountText(event.target.value)}
          placeholder="0"
          value={formatInput(amountText)}
        />
        <span className="text-body-lg shrink-0 text-grayscale-800">원</span>
      </div>

      <label
        className="text-caption mt-4 block text-grayscale-700"
        htmlFor="budget-threshold"
      >
        {threshold}% 를 쓰면 알려드릴게요
      </label>
      <input
        className="mt-2 w-full accent-yellow-500"
        id="budget-threshold"
        max={100}
        min={10}
        onChange={(event) => setThreshold(Number(event.target.value))}
        step={5}
        type="range"
        value={threshold}
      />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          className="text-title-sm flex h-12 items-center justify-center rounded-2xl bg-grayscale-200 text-grayscale-700"
          onClick={onCancel}
          type="button"
        >
          취소
        </button>
        <button
          className="text-title-sm flex h-12 items-center justify-center rounded-2xl bg-yellow-400 text-grayscale-1000 disabled:bg-grayscale-200 disabled:text-grayscale-700"
          disabled={!isAmountValid || isSubmitting}
          onClick={handleSubmit}
          type="button"
        >
          {isSubmitting ? "저장 중" : "저장"}
        </button>
      </div>
    </section>
  );
}

function budgetName(status: BudgetStatus): string {
  const found = BUDGET_CATEGORIES.find(
    (option) => option.code === status.categoryCode,
  );
  if (found?.code) return found.label;
  return "전체";
}

/** 입력 중에도 천 단위로 끊어 읽히게 한다. 금액을 잘못 보고 넣는 것을 줄인다. */
function formatInput(text: string): string {
  const digits = text.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}
