"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import {
  type ApprovalDecision,
  approvalStateLabel,
  classifyApproval,
  decideApproval,
  type FamilyAlert,
  fetchFamilyOverview,
  remainingLabel,
  type TransferApproval,
} from "@/features/family/api/family";
import { describeApiError } from "@/shared/api/apiResponse";
import { useBackendQuery } from "@/shared/hooks/useBackendQuery";
import { Header, HeaderBackButton } from "@/shared/layout/Header";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import { formatRelativeTime, formatWon } from "@/shared/ui/money";
import { Skeleton } from "@/shared/ui/Skeleton";
import { EmptyState, StaleNotice } from "@/shared/ui/StateMessage";

type PendingDecision = Readonly<{
  approval: TransferApproval;
  decision: ApprovalDecision;
}>;

/**
 * 가족 보호.
 *
 * <p>이 화면의 첫 번째 자리는 <b>승인 대기</b> 다. 알림은 이미 일어난 일을 알려줄 뿐이지만,
 * 승인 대기는 아직 막을 수 있는 이체다. 지금 행동이 필요한 것을 맨 위에 둔다.
 */
export function FamilyProtectionScreen() {
  const router = useRouter();

  const fetcher = useCallback(() => fetchFamilyOverview(), []);
  const { data, error, isInitialLoading, refetch } = useBackendQuery(fetcher);

  const [pending, setPending] = useState<PendingDecision | null>(null);
  const [isDeciding, setIsDeciding] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  const pendingApprovals = data?.pendingApprovals ?? [];
  const myRequests = data?.myRequests ?? [];
  const alerts = data?.alerts ?? [];
  const dashboard = data?.dashboard ?? null;

  const handleDecide = async () => {
    if (!pending || isDeciding) return;

    setIsDeciding(true);
    setDecisionError(null);

    try {
      await decideApproval(pending.approval.approvalId, pending.decision, "");
      setPending(null);
      // 목록을 직접 고치지 않고 다시 불러온다. 서버가 만료 등으로 상태를
      // 다르게 확정했을 수 있고, 화면이 그걸 앞질러 말하면 안 된다.
      await refetch();
    } catch (cause) {
      setDecisionError(describeApiError(cause));
    } finally {
      setIsDeciding(false);
    }
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <Header
        leftSlot={<HeaderBackButton onClick={() => router.back()} />}
        rightSlot={<div aria-hidden="true" className="size-10" />}
        title="가족 보호"
      />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-4">
        {isInitialLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton className="h-24 w-full rounded-2xl" key={index} />
            ))}
          </div>
        ) : (
          <>
            <section>
              <h2 className="text-title-sm text-grayscale-1000">
                승인 대기
                {pendingApprovals.length > 0 ? (
                  <span className="text-body-md ml-1.5 text-orange">
                    {pendingApprovals.length}
                  </span>
                ) : null}
              </h2>

              {pendingApprovals.length === 0 ? (
                <EmptyState
                  className="rounded-2xl border border-grayscale-100 bg-background"
                  description="보호 대상의 큰 이체가 생기면 여기서 승인할 수 있어요"
                  title="승인할 이체가 없어요"
                />
              ) : (
                <ul className="mt-2 space-y-3">
                  {pendingApprovals.map((approval) => (
                    <li key={approval.approvalId}>
                      <PendingApprovalCard
                        approval={approval}
                        disabled={isDeciding}
                        onApprove={() =>
                          setPending({ approval, decision: "approve" })
                        }
                        onReject={() =>
                          setPending({ approval, decision: "reject" })
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {myRequests.length > 0 ? (
              <section className="mt-7">
                <h2 className="text-title-sm text-grayscale-1000">
                  내가 요청한 이체
                </h2>
                <ul className="mt-2 space-y-2">
                  {myRequests.map((approval) => (
                    <li key={approval.approvalId}>
                      <MyRequestRow approval={approval} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="mt-7">
              <h2 className="text-title-sm text-grayscale-1000">최근 알림</h2>
              {alerts.length === 0 ? (
                <EmptyState
                  className="rounded-2xl border border-grayscale-100 bg-background"
                  description="이상한 거래가 보이면 보호자에게 알려드려요"
                  title="받은 알림이 없어요"
                />
              ) : (
                <ul className="mt-2 space-y-2">
                  {alerts.map((alert, index) => (
                    <li key={`${alert.sentAt}-${index}`}>
                      <AlertRow alert={alert} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {dashboard ? (
              <section className="mt-7 rounded-2xl border border-grayscale-100 bg-background px-5 py-5">
                <h2 className="text-title-sm text-grayscale-1000">이번 달 요약</h2>
                <dl className="mt-3 space-y-2">
                  <SummaryRow label="보낸 알림" value={dashboard.alertCount} />
                  <SummaryRow
                    label="이상 거래"
                    value={dashboard.unusualTransactionCount}
                  />
                  <SummaryRow
                    label="전달한 월간 리포트"
                    value={dashboard.monthlyReportDeliveredCount}
                  />
                </dl>
              </section>
            ) : null}

            {error ? (
              <StaleNotice className="mt-6 justify-center" onRetry={refetch} />
            ) : null}
          </>
        )}
      </section>

      {pending ? (
        <ConfirmModal
          onPrimary={handleDecide}
          onSecondary={() => {
            if (isDeciding) return;
            setPending(null);
            setDecisionError(null);
          }}
          primaryDisabled={isDeciding}
          primaryLabel={
            isDeciding
              ? "처리 중..."
              : pending.decision === "approve"
                ? "승인"
                : "거절"
          }
          secondaryLabel="취소"
          title={
            pending.decision === "approve"
              ? `${formatWon(pending.approval.amount)}을 보내도록 승인할까요?`
              : `${formatWon(pending.approval.amount)} 이체를 거절할까요?`
          }
        />
      ) : null}

      {decisionError ? (
        <p
          className="text-body-md px-6 pb-4 text-center text-red"
          role="alert"
        >
          {decisionError}
        </p>
      ) : null}
    </main>
  );
}

/**
 * 승인 대기 카드.
 *
 * <p>금액과 받는 계좌를 가장 크게 둔다. 보호자가 판단할 근거는 "얼마가 어디로 가는가" 이고,
 * 그것을 읽지 않고 승인 버튼부터 누르게 만들면 이 기능이 있는 이유가 사라진다.
 */
function PendingApprovalCard({
  approval,
  disabled,
  onApprove,
  onReject,
}: Readonly<{
  approval: TransferApproval;
  disabled: boolean;
  onApprove: () => void;
  onReject: () => void;
}>) {
  const remaining = remainingLabel(approval.expiresAt);

  return (
    <article className="rounded-2xl border border-orange/30 bg-background px-5 py-5">
      <p className="text-body-md text-grayscale-700">
        {approval.requesterUserId ? "보호 대상의 이체 요청" : "이체 요청"}
      </p>
      <p className="text-title-lg tabular-nums mt-1 text-grayscale-1000">
        {formatWon(approval.amount)}
      </p>
      <p className="text-body-md tabular-nums mt-1 break-all text-grayscale-800">
        {approval.toAccountMasked ?? "받는 계좌 정보 없음"}
      </p>

      {remaining ? (
        <p className="text-caption mt-2 text-orange">{remaining}</p>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button
          className="text-title-sm h-12 flex-1 rounded-2xl border border-grayscale-200 text-grayscale-800 active:bg-grayscale-100"
          disabled={disabled}
          onClick={onReject}
          type="button"
        >
          거절
        </button>
        <button
          className="text-title-sm h-12 flex-1 rounded-2xl bg-yellow-400 text-espresso active:bg-yellow-500"
          disabled={disabled}
          onClick={onApprove}
          type="button"
        >
          승인
        </button>
      </div>
    </article>
  );
}

function MyRequestRow({ approval }: Readonly<{ approval: TransferApproval }>) {
  const state = classifyApproval(approval.status);

  return (
    <article className="flex items-center justify-between gap-3 rounded-2xl border border-grayscale-100 bg-background px-5 py-4">
      <div className="min-w-0">
        <p className="text-title-sm tabular-nums text-grayscale-1000">
          {formatWon(approval.amount)}
        </p>
        <p className="text-caption mt-0.5 truncate text-grayscale-600">
          {approval.toAccountMasked ?? "받는 계좌 정보 없음"}
        </p>
      </div>
      <span
        className={`text-caption shrink-0 rounded-full px-2.5 py-1 ${stateClassNames[state]}`}
      >
        {approvalStateLabel(state)}
      </span>
    </article>
  );
}

const stateClassNames: Record<
  ReturnType<typeof classifyApproval>,
  string
> = {
  approved: "bg-green/10 text-green",
  expired: "bg-grayscale-100 text-grayscale-700",
  pending: "bg-orange/10 text-orange",
  rejected: "bg-grayscale-100 text-grayscale-800",
};

function AlertRow({ alert }: Readonly<{ alert: FamilyAlert }>) {
  return (
    <article className="rounded-2xl border border-grayscale-100 bg-background px-5 py-4">
      <p className="text-body-md text-grayscale-1000">{alert.message}</p>
      {alert.sentAt ? (
        <p className="text-caption mt-1 text-grayscale-600">
          {formatRelativeTime(alert.sentAt)}
        </p>
      ) : null}
    </article>
  );
}

function SummaryRow({
  label,
  value,
}: Readonly<{ label: string; value: number }>) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-body-md text-grayscale-700">{label}</dt>
      <dd className="text-body-md tabular-nums text-grayscale-1000">
        {value.toLocaleString("ko-KR")}건
      </dd>
    </div>
  );
}
