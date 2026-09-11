"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import {
  connectableInstitutions,
  describeLinkOutcome,
  readLinkOutcome,
  startInstitutionLink,
} from "@/features/mypage/api/institutionLink";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // 정보제공자에서 돌아오면 백엔드 콜백이 결과를 쿼리에 실어 보낸다.
  const outcome = readLinkOutcome(searchParams);
  const fromOnboarding = searchParams.get("from") === "onboarding";

  const fetcher = useCallback(() => fetchLinkedInstitutions(), []);
  const { data, error, isInitialLoading, refetch } = useBackendQuery(fetcher);

  const [pendingUnlink, setPendingUnlink] = useState<LinkedInstitution | null>(
    null,
  );
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [unlinkError, setUnlinkError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  const institutions = (data ?? []).filter(isInstitutionLinked);
  const connectable = connectableInstitutions(
    institutions.map((institution) => institution.institutionCode),
  );

  const handleConnect = async (institutionCode: string) => {
    if (connecting) return;

    setConnecting(institutionCode);
    setConnectError(null);

    try {
      const authorizeUrl = await startInstitutionLink(institutionCode);
      // 정보제공자의 동의 화면으로 넘어간다. 돌아오면 이 화면이 결과를 보여준다.
      window.location.assign(authorizeUrl);
    } catch {
      setConnectError("연결을 시작하지 못했어요. 잠시 후 다시 시도해주세요");
      setConnecting(null);
    }
  };

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

  // 결과를 읽었으면 주소에서 지운다. 남겨 두면 새로고침할 때마다 같은 알림이 떠서 연결을 두 번
  // 한 것처럼 읽힌다.
  const dismissOutcome = () => router.replace(pathname);

  return (
    <SettingsScreenShell
      description="연결한 기관의 계좌·거래내역으로 자산 흐름을 예측해 드려요. 해제하면 그 기관의 정보는 더 이상 가져오지 않아요."
      errorMessage="연동 정보를 불러오지 못했어요"
      hasError={Boolean(error)}
      isEmpty={false}
      isInitialLoading={isInitialLoading}
      onRetry={refetch}
      title="금융 연동 관리"
    >
      {outcome ? (
        <div
          className={`mb-5 flex items-start justify-between gap-3 rounded-2xl px-5 py-4 ${
            outcome.kind === "linked" ? "bg-yellow-100" : "bg-grayscale-100"
          }`}
          role={outcome.kind === "linked" ? "status" : "alert"}
        >
          <p className="text-body-md text-grayscale-1000">
            {describeLinkOutcome(outcome, institutionName)}
          </p>
          <button
            className="text-caption shrink-0 text-grayscale-700 underline"
            onClick={dismissOutcome}
            type="button"
          >
            닫기
          </button>
        </div>
      ) : null}

      {fromOnboarding && institutions.length === 0 ? (
        <p className="text-body-lg mb-5 text-grayscale-1000">
          쓰고 있는 은행을 연결해주세요. 연결하면 월말 위험을 미리 알려드려요.
        </p>
      ) : null}

      <h2 className="text-title-sm text-grayscale-1000">연결된 기관</h2>
      {institutions.length === 0 ? (
        <p className="text-body-md mt-2 text-grayscale-700">
          아직 연결된 금융기관이 없어요
        </p>
      ) : (
        <ul className="mt-2 space-y-3">
          {institutions.map((institution) => {
            const needsRelink = hasLinkProblem(institution);
            return (
              <li
                className="flex items-center justify-between gap-3 rounded-2xl border border-grayscale-100 bg-background px-5 py-5"
                key={institution.institutionCode}
              >
                <div className="min-w-0">
                  <p className="text-title-sm truncate text-grayscale-1000">
                    {institutionName(institution.institutionCode)}
                  </p>
                  <p
                    className={`text-caption mt-0.5 ${
                      needsRelink ? "text-red" : "text-grayscale-600"
                    }`}
                  >
                    {describeLink(institution)}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {needsRelink ? (
                    // 오류 상태의 연동은 데이터가 멈춰 있다. 해제만 두면 다시 잇는 길이 없다.
                    <button
                      className="text-body-md rounded-full bg-yellow-400 px-3 py-1.5 text-grayscale-1000 disabled:bg-grayscale-200"
                      disabled={connecting !== null}
                      onClick={() => void handleConnect(institution.institutionCode)}
                      type="button"
                    >
                      다시 연결
                    </button>
                  ) : null}
                  <button
                    className="text-body-md rounded-full border border-grayscale-200 px-3 py-1.5 text-grayscale-800 active:bg-grayscale-100"
                    onClick={() => {
                      setUnlinkError(null);
                      setPendingUnlink(institution);
                    }}
                    type="button"
                  >
                    연동 해제
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {unlinkError ? (
        <p className="text-body-md mt-4 text-red" role="alert">
          {unlinkError}
        </p>
      ) : null}

      <h2 className="text-title-sm mt-8 text-grayscale-1000">
        연결할 수 있는 기관
      </h2>
      {connectable.length === 0 ? (
        <p className="text-body-md mt-2 text-grayscale-700">
          연결할 수 있는 기관을 모두 연결했어요
        </p>
      ) : (
        <ul className="mt-2 grid grid-cols-2 gap-3">
          {connectable.map((code) => (
            <li key={code}>
              <button
                className="flex w-full items-center justify-between gap-2 rounded-2xl border border-grayscale-100 bg-background px-4 py-4 text-left disabled:opacity-60"
                disabled={connecting !== null}
                onClick={() => void handleConnect(code)}
                type="button"
              >
                <span className="text-body-md min-w-0 truncate text-grayscale-1000">
                  {institutionName(code)}
                </span>
                <span className="text-caption shrink-0 text-grayscale-700">
                  {connecting === code ? "이동 중" : "연결"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {connectError ? (
        <p className="text-body-md mt-4 text-red" role="alert">
          {connectError}
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

function hasLinkProblem(institution: LinkedInstitution): boolean {
  const status = institution.status?.toUpperCase();
  return Boolean(institution.lastErrorCode) || status === "FAILED" || status === "EXPIRED";
}

function describeLink(institution: LinkedInstitution): string {
  // 연동 오류는 숨기지 않는다. 오류 상태의 기관은 데이터가 멈춰 있다는 뜻이다.
  if (hasLinkProblem(institution)) {
    return "연동에 문제가 있어요. 다시 연결해주세요";
  }
  if (institution.linkedAt) {
    return `${formatKoreanDate(institution.linkedAt)} 연동`;
  }
  return "연동됨";
}
