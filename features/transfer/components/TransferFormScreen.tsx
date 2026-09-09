"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import {
  describeStepUpError,
  stepUpWithBiometrics,
} from "@/features/security";
import {
  classifyTransfer,
  executeTransfer,
  fetchTransferOverview,
  newIdempotencyKey,
  type Transfer,
} from "@/features/transfer/api/transfer";
import { TransferResult } from "@/features/transfer/components/TransferResult";
import { describeApiError } from "@/shared/api/apiResponse";
import { useCurrentUser } from "@/shared/auth/currentUser";
import { useBackendQuery } from "@/shared/hooks/useBackendQuery";
import { Header, HeaderBackButton } from "@/shared/layout/Header";
import { BottomActionBar } from "@/shared/ui/BottomActionBar";
import { formatWon } from "@/shared/ui/money";
import { Skeleton } from "@/shared/ui/Skeleton";

type Step = "form" | "confirm" | "result";

export function TransferFormScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();

  const fetcher = useCallback(() => fetchTransferOverview(), []);
  const { data, isInitialLoading } = useBackendQuery(fetcher);

  const accounts = data?.accounts ?? [];
  const limit = data?.limit?.limit ?? null;

  const [step, setStep] = useState<Step>("form");
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amountText, setAmountText] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<Transfer | null>(null);

  /**
   * 멱등키는 화면에 들어올 때 한 번만 만든다.
   *
   * <p>재시도할 때마다 새로 만들면 멱등성이 사라져 같은 이체가 두 번 나간다.
   * 이 화면에서 보내는 이체는 성공하든 실패하든 하나다.
   */
  const idempotencyKey = useMemo(() => newIdempotencyKey(), []);

  const amount = parseAmount(amountText);
  const overLimit = limit !== null && amount > limit;

  const canSubmit =
    fromAccount.trim().length > 0 &&
    toAccount.trim().length > 0 &&
    amount > 0 &&
    !overLimit;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 이체는 LEVEL_3 다. 생체인증을 통과해야 증명이 나온다.
      const stepUp = await stepUpWithBiometrics(user.userId ?? "");

      const transfer = await executeTransfer({
        amount,
        assertionToken: stepUp.assertionToken,
        description: description.trim() || undefined,
        fromAccount: fromAccount.trim(),
        idempotencyKey,
        riskProof: stepUp.riskProof,
        toAccount: toAccount.trim(),
      });

      setResult(transfer);
      setStep("result");
    } catch (error) {
      // 여기서 실패한 것은 "요청을 보내지 못했다" 이다. 이미 보낸 뒤 응답을 못 받은
      // 경우는 서버가 UNKNOWN 으로 돌려주므로 결과 화면에서 다룬다.
      setSubmitError(
        error instanceof Error && error.name === "StepUpError"
          ? describeStepUpError(error)
          : describeApiError(error),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "result") {
    return (
      <TransferResult
        amount={amount}
        onDone={() => router.replace("/transfer")}
        outcome={classifyTransfer(result?.status)}
        toAccount={toAccount}
        transfer={result}
      />
    );
  }

  const isConfirm = step === "confirm";

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <Header
        leftSlot={
          <HeaderBackButton
            onClick={() => (isConfirm ? setStep("form") : router.back())}
          />
        }
        rightSlot={<div aria-hidden="true" className="size-10" />}
        title={isConfirm ? "이체 확인" : "이체하기"}
      />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-4">
        {isConfirm ? (
          <ConfirmPanel
            amount={amount}
            description={description}
            fromAccount={fromAccount}
            toAccount={toAccount}
          />
        ) : (
          <FormPanel
            accounts={accounts}
            amountText={amountText}
            description={description}
            fromAccount={fromAccount}
            isLoading={isInitialLoading}
            limit={limit}
            onAmountChange={setAmountText}
            onDescriptionChange={setDescription}
            onFromAccountChange={setFromAccount}
            onToAccountChange={setToAccount}
            overLimit={overLimit}
            toAccount={toAccount}
          />
        )}

        {submitError ? (
          <p className="text-body-md mt-4 text-red" role="alert">
            {submitError}
          </p>
        ) : null}
      </section>

      <BottomActionBar
        actionLabel={
          isConfirm ? (isSubmitting ? "보내는 중..." : "생체인증 후 보내기") : "다음"
        }
        actionTextStyle="title-sm"
        bottomSpacing="compact"
        className="shrink-0 bg-background"
        disabled={!canSubmit || isSubmitting}
        onAction={() => (isConfirm ? void handleSubmit() : setStep("confirm"))}
      />
    </main>
  );
}

function FormPanel({
  accounts,
  amountText,
  description,
  fromAccount,
  isLoading,
  limit,
  onAmountChange,
  onDescriptionChange,
  onFromAccountChange,
  onToAccountChange,
  overLimit,
  toAccount,
}: Readonly<{
  accounts: readonly { accountNo: string; alias?: string | null }[];
  amountText: string;
  description: string;
  fromAccount: string;
  isLoading: boolean;
  limit: number | null;
  onAmountChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFromAccountChange: (value: string) => void;
  onToAccountChange: (value: string) => void;
  overLimit: boolean;
  toAccount: string;
}>) {
  const amount = parseAmount(amountText);

  return (
    <>
      <Field label="출금 계좌">
        <input
          className={inputClassName}
          inputMode="numeric"
          onChange={(event) => onFromAccountChange(event.target.value)}
          placeholder="계좌번호를 입력해 주세요"
          value={fromAccount}
        />
      </Field>

      <Field className="mt-5" label="입금 계좌">
        <input
          className={inputClassName}
          inputMode="numeric"
          onChange={(event) => onToAccountChange(event.target.value)}
          placeholder="받는 분 계좌번호"
          value={toAccount}
        />
        {/* 등록 계좌가 있으면 직접 입력 대신 고르게 한다. 계좌번호 오타는 되돌리기 어렵다. */}
        {isLoading ? (
          <Skeleton className="mt-2 h-8 w-40 rounded-full" />
        ) : accounts.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {accounts.map((account) => (
              <li key={account.accountNo}>
                <button
                  className="text-body-md rounded-full border border-grayscale-200 bg-background px-3 py-1.5 text-grayscale-800 active:bg-grayscale-100"
                  onClick={() => onToAccountChange(account.accountNo)}
                  type="button"
                >
                  {account.alias?.trim() || account.accountNo}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </Field>

      <Field className="mt-5" label="보낼 금액">
        <input
          aria-invalid={overLimit}
          className={`${inputClassName} tabular-nums ${overLimit ? "border-red" : ""}`}
          inputMode="numeric"
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder="0"
          value={amountText}
        />
        {amount > 0 ? (
          <p className="text-body-md tabular-nums mt-1 text-grayscale-900">
            {formatWon(amount)}
          </p>
        ) : null}
        {overLimit && limit !== null ? (
          <p className="text-body-md mt-1 text-red" role="alert">
            하루 한도 {formatWon(limit)}을 넘었어요
          </p>
        ) : null}
      </Field>

      <Field className="mt-5" label="받는 분에게 표시할 내용">
        <input
          className={inputClassName}
          maxLength={255}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="선택 입력"
          value={description}
        />
      </Field>
    </>
  );
}

/**
 * 확인 단계.
 *
 * <p>보내기 직전에 무엇이 일어나는지 한 화면에 모아 보여준다. 금액을 가장 크게 두어
 * 자릿수를 잘못 넣은 것이 눈에 띄게 한다 — 이체에서 가장 잦은 사고다.
 */
function ConfirmPanel({
  amount,
  description,
  fromAccount,
  toAccount,
}: Readonly<{
  amount: number;
  description: string;
  fromAccount: string;
  toAccount: string;
}>) {
  return (
    <section className="rounded-2xl bg-background px-5 py-6 shadow-2">
      <p className="text-body-md text-center text-grayscale-800">보낼 금액</p>
      <p className="text-display tabular-nums mt-1 text-center text-grayscale-1000">
        {formatWon(amount)}
      </p>

      <dl className="mt-6 space-y-3">
        <Row label="받는 계좌" value={toAccount} />
        <Row label="출금 계좌" value={fromAccount} />
        {description.trim() ? (
          <Row label="표시 내용" value={description.trim()} />
        ) : null}
      </dl>

      <p className="text-caption mt-6 text-center text-grayscale-600">
        보내기를 누르면 생체인증을 거쳐 즉시 이체돼요
      </p>
    </section>
  );
}

function Row({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-body-md shrink-0 text-grayscale-700">{label}</dt>
      <dd className="text-body-md tabular-nums min-w-0 break-all text-right text-grayscale-1000">
        {value}
      </dd>
    </div>
  );
}

function Field({
  children,
  className = "",
  label,
}: Readonly<{ children: React.ReactNode; className?: string; label: string }>) {
  return (
    <label className={`block ${className}`}>
      <span className="text-body-md text-grayscale-800">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

const inputClassName =
  "text-body-lg h-13 w-full rounded-2xl border border-grayscale-200 bg-background px-4 text-grayscale-1000 placeholder:text-grayscale-400 focus:border-grayscale-1000";

/** 입력에서 숫자만 남긴다. 쉼표를 지우지 않으면 1,000 이 NaN 이 된다. */
function parseAmount(text: string): number {
  const digits = text.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}
