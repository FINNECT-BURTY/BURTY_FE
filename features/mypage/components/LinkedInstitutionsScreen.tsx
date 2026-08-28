"use client";

import { useCallback, useState } from "react";

import {
  fetchLinkedInstitutions,
  institutionName,
  isInstitutionLinked,
  type LinkedInstitution,
  unlinkInstitution,
} from "@/features/mypage/api/settings";
import { SettingsScreenShell } from "@/features/mypage/ui/SettingsScreenShell";
import { useBackendQuery } from "@/shared/hooks/useBackendQuery";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import { formatKoreanDate } from "@/shared/ui/money";
import { StaleNotice } from "@/shared/ui/StateMessage";

export function LinkedInstitutionsScreen() {
  const fetcher = useCallback(() => fetchLinkedInstitutions(), []);
  const { data, error, isInitialLoading, refetch } = useBackendQuery(fetcher);

  const [pendingUnlink, setPendingUnlink] = useState<LinkedInstitution | null>(
    null,
  );
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [unlinkError, setUnlinkError] = useState<string | null>(null);

  const institutions = (data ?? []).filter(isInstitutionLinked);

  const handleUnlink = async () => {
    if (!pendingUnlink || isUnlinking) return;

    setIsUnlinking(true);
    setUnlinkError(null);

    try {
      await unlinkInstitution(pendingUnlink.institutionCode);
      setPendingUnlink(null);
      refetch();
    } catch {
      // 실패를 조용히 넘기지 않는다. 끊긴 줄 알고 떠나면 연동이 남아 있다.
      setUnlinkError("연동 해제에 실패했어요. 잠시 후 다시 시도해주세요");
    } finally {
      setIsUnlinking(false);
    }
  };

  return (
    <SettingsScreenShell
      description="연동을 해제하면 해당 기관의 거래 내역으로 만든 예측이 더 이상 갱신되지 않아요."
      emptyDescription="계좌를 연동하면 자산 흐름을 예측해 드려요"
      emptyTitle="연동된 금융기관이 없어요"
      errorMessage="연동 정보를 불러오지 못했어요"
      hasError={Boolean(error)}
      isEmpty={institutions.length === 0}
      isInitialLoading={isInitialLoading}
      onRetry={refetch}
      title="금융 연동 관리"
    >
      <ul className="space-y-3">
        {institutions.map((institution) => (
          <li
            className="flex items-center justify-between gap-3 rounded-2xl border border-grayscale-100 bg-background px-5 py-5"
            key={institution.institutionCode}
          >
            <div className="min-w-0">
              <p className="text-title-sm truncate text-grayscale-1000">
                {institutionName(institution.institutionCode)}
              </p>
              <p className="text-caption mt-0.5 text-grayscale-600">
                {describeLink(institution)}
              </p>
            </div>

            <button
              className="text-body-md shrink-0 rounded-full border border-grayscale-200 px-3 py-1.5 text-grayscale-800 active:bg-grayscale-100"
              onClick={() => {
                setUnlinkError(null);
                setPendingUnlink(institution);
              }}
              type="button"
            >
              연동 해제
            </button>
          </li>
        ))}
      </ul>

      {unlinkError ? (
        <p className="text-body-md mt-4 text-red" role="alert">
          {unlinkError}
        </p>
      ) : null}

      {error ? (
        <StaleNotice className="mt-6 justify-center" onRetry={refetch} />
      ) : null}

      {pendingUnlink ? (
        <ConfirmModal
          onPrimary={handleUnlink}
          onSecondary={() => {
            if (isUnlinking) return;
            setPendingUnlink(null);
          }}
          primaryDisabled={isUnlinking}
          primaryLabel={isUnlinking ? "해제 중..." : "연동 해제"}
          secondaryLabel="취소"
          title={`${institutionName(pendingUnlink.institutionCode)} 연동을 해제할까요?\n예측에 쓰이던 거래 내역이 더 이상 갱신되지 않아요.`}
        />
      ) : null}
    </SettingsScreenShell>
  );
}

function describeLink(institution: LinkedInstitution): string {
  // 연동 오류는 숨기지 않는다. 오류 상태의 기관은 데이터가 멈춰 있다는 뜻이다.
  if (institution.lastErrorCode) {
    return "연동에 문제가 있어요. 다시 연결해주세요";
  }
  if (institution.linkedAt) {
    return `${formatKoreanDate(institution.linkedAt)} 연동`;
  }
  return "연동됨";
}
