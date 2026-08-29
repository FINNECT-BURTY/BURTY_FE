"use client";

import Image from "next/image";

import {
  isAwaitingApproval,
  type Transfer,
  type TransferOutcome,
  transferOutcomeDescription,
  transferOutcomeLabel,
} from "@/features/transfer/api/transfer";
import { Header } from "@/shared/layout/Header";
import { BottomActionBar } from "@/shared/ui/BottomActionBar";
import { formatWon } from "@/shared/ui/money";

type TransferResultProps = Readonly<{
  amount: number;
  onDone: () => void;
  outcome: TransferOutcome;
  toAccount: string;
  transfer: Transfer | null;
}>;

/** 상태별 아이콘. 결과가 정해지지 않은 건에 성공·실패 아이콘을 쓰지 않는다. */
const outcomeIcons: Record<TransferOutcome, string> = {
  completed: "/icons/main/money.svg",
  pending: "/icons/main/money.svg",
  rejected: "/icons/main/warning-red.svg",
  unknown: "/icons/main/warning-orange.svg",
};

const outcomeToneClassNames: Record<TransferOutcome, string> = {
  completed: "text-green",
  pending: "text-grayscale-900",
  rejected: "text-red",
  unknown: "text-orange",
};

/**
 * 이체 결과.
 *
 * <p>이 화면의 핵심은 {@code UNKNOWN} 이다. 은행 응답을 받지 못한 상태로, <b>출금됐을 수도
 * 있다.</b> 여기서 "실패했어요" 라고 말하면 사용자는 같은 이체를 다시 보내고, 그러면 돈이 두 번
 * 나간다. 실패로 뭉뚱그리지 않고 "확인 중" 으로 두면서 다시 보내지 말라고 분명히 적는다.
 */
export function TransferResult({
  amount,
  onDone,
  outcome,
  toAccount,
  transfer,
}: TransferResultProps) {
  const awaitingApproval = isAwaitingApproval(transfer?.status);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
      <Header
        leftSlot={<div aria-hidden="true" className="size-10" />}
        rightSlot={<div aria-hidden="true" className="size-10" />}
        title="이체 결과"
      />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pt-6 text-center">
        <Image
          alt=""
          aria-hidden="true"
          className="mx-auto"
          height={48}
          priority
          src={outcomeIcons[outcome]}
          width={48}
        />

        <h1
          className={`text-title-lg mt-4 ${outcomeToneClassNames[outcome]}`}
        >
          {awaitingApproval ? "보호자 승인을 기다려요" : transferOutcomeLabel(outcome)}
        </h1>

        <p className="text-body-lg mt-2 whitespace-pre-line text-grayscale-900">
          {awaitingApproval
            ? "보호자가 승인하면 이체가 진행돼요"
            : transferOutcomeDescription(outcome)}
        </p>

        <p className="text-display tabular-nums mt-6 text-grayscale-1000">
          {formatWon(amount)}
        </p>
        <p className="text-body-md mt-1 break-all text-grayscale-700">
          {toAccount}
        </p>

        {/*
          결과가 확정되지 않은 건에는 재시도 버튼을 두지 않는다. 누를 수 있게 두면
          누른다. 확인될 때까지 사용자가 할 수 있는 일은 기다리는 것뿐이다.
        */}
        {outcome === "unknown" ? (
          <section className="mt-6 rounded-2xl border border-orange/30 bg-orange/5 px-5 py-4 text-left">
            <p className="text-title-sm text-grayscale-1000">
              다시 보내지 마세요
            </p>
            <p className="text-body-md mt-1 text-grayscale-900">
              같은 이체를 한 번 더 보내면 두 번 빠져나갈 수 있어요. 은행에 확인한 뒤
              알림으로 결과를 알려드릴게요.
            </p>
          </section>
        ) : null}

        {transfer?.transferId ? (
          <p className="text-caption mt-6 break-all text-grayscale-600">
            거래번호 {transfer.transferId}
          </p>
        ) : null}

        {transfer?.familyNotified ? (
          <p className="text-caption mt-1 text-grayscale-600">
            보호자에게 알림을 보냈어요
          </p>
        ) : null}
      </section>

      <BottomActionBar
        actionLabel="확인"
        actionTextStyle="title-sm"
        bottomSpacing="compact"
        className="shrink-0 bg-background"
        onAction={onDone}
      />
    </main>
  );
}
