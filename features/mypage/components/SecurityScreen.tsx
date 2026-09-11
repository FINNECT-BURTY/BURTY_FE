"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import {
  fetchSecurity,
  revokeAllSessions,
  type UserDevice,
} from "@/features/mypage/api/settings";
import { SettingsScreenShell } from "@/features/mypage/ui/SettingsScreenShell";
import { describeStepUpError, StepUpError } from "@/features/security";
import { useCurrentUser } from "@/shared/auth/currentUser";
import {
  clearAuthTokens,
  clearSessionMarker,
} from "@/shared/auth/tokenStorage";
import { useBackendQuery } from "@/shared/hooks/useBackendQuery";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import { formatRelativeTime } from "@/shared/ui/money";
import { StaleNotice } from "@/shared/ui/StateMessage";

export function SecurityScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();

  const fetcher = useCallback(() => fetchSecurity(), []);
  const { data, error, isInitialLoading, refetch } = useBackendQuery(fetcher);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const devices = data?.devices ?? [];
  const sessions = data?.sessions ?? [];

  const handleRevokeAll = async () => {
    if (isRevoking) return;

    setIsRevoking(true);
    setRevokeError(null);

    try {
      // 되돌릴 수 없는 동작이라 백엔드가 LEVEL_3 를 요구한다. 생체 단계 인증을 거친다.
      await revokeAllSessions(user?.userId ?? "");
      // 모든 세션을 끊었으므로 현재 기기도 로그아웃 상태다. 남은 토큰을 지우고 나간다.
      clearAuthTokens();
      clearSessionMarker();
      router.replace("/onboarding?step=entry");
    } catch (cause) {
      setRevokeError(
        cause instanceof StepUpError
          ? describeStepUpError(cause)
          : "로그아웃에 실패했어요. 잠시 후 다시 시도해주세요",
      );
      setIsRevoking(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <SettingsScreenShell
      description="로그인된 기기를 확인하고, 모르는 기기가 있으면 모두 로그아웃하세요."
      emptyDescription="다른 기기에서 로그인하면 여기에 표시돼요"
      emptyTitle="로그인된 기기 정보가 없어요"
      errorMessage="기기 정보를 불러오지 못했어요"
      hasError={Boolean(error)}
      isEmpty={devices.length === 0 && sessions.length === 0}
      isInitialLoading={isInitialLoading}
      onRetry={refetch}
      title="보안"
    >
      {devices.length > 0 ? (
        <section>
          <h2 className="text-title-sm text-grayscale-1000">등록된 기기</h2>
          <ul className="mt-2 space-y-3">
            {devices.map((device) => (
              <li
                className="flex items-center justify-between gap-3 rounded-2xl border border-grayscale-100 bg-background px-5 py-5"
                key={device.deviceId}
              >
                <div className="min-w-0">
                  <p className="text-title-sm truncate text-grayscale-1000">
                    {deviceLabel(device)}
                  </p>
                  <p className="text-caption mt-0.5 text-grayscale-600">
                    {device.lastSeenAt
                      ? `마지막 접속 ${formatRelativeTime(device.lastSeenAt)}`
                      : "접속 기록 없음"}
                  </p>
                </div>

                {/* 신뢰 기기는 단계 인증을 건너뛸 수 있어, 사용자가 알아볼 수 있어야 한다. */}
                {device.trusted ? (
                  <span className="text-caption shrink-0 rounded-full bg-green/10 px-2.5 py-1 text-green">
                    신뢰 기기
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={devices.length > 0 ? "mt-6" : undefined}>
        <h2 className="text-title-sm text-grayscale-1000">
          로그인 세션
          <span className="text-body-md ml-1.5 text-grayscale-600">
            {sessions.length}
          </span>
        </h2>
        <p className="text-body-md mt-2 text-grayscale-800">
          기기를 잃어버렸거나 모르는 접속이 보이면 모두 로그아웃하세요. 현재
          기기도 함께 로그아웃됩니다.
        </p>

        <button
          className="text-title-sm mt-4 h-13 w-full rounded-2xl border border-red/30 text-red active:bg-red/5"
          onClick={() => {
            setRevokeError(null);
            setIsConfirmOpen(true);
          }}
          type="button"
        >
          모든 기기에서 로그아웃
        </button>
      </section>

      {revokeError ? (
        <p className="text-body-md mt-4 text-red" role="alert">
          {revokeError}
        </p>
      ) : null}

      {error ? (
        <StaleNotice className="mt-6 justify-center" onRetry={refetch} />
      ) : null}

      {isConfirmOpen ? (
        <ConfirmModal
          onPrimary={handleRevokeAll}
          onSecondary={() => {
            if (isRevoking) return;
            setIsConfirmOpen(false);
          }}
          primaryDisabled={isRevoking}
          primaryLabel={isRevoking ? "처리 중..." : "모두 로그아웃"}
          secondaryLabel="취소"
          title={"모든 기기에서 로그아웃할까요?\n현재 기기도 함께 로그아웃됩니다."}
        />
      ) : null}
    </SettingsScreenShell>
  );
}

function deviceLabel(device: UserDevice): string {
  if (device.deviceName?.trim()) return device.deviceName;
  if (device.platform?.trim()) return device.platform;
  return "알 수 없는 기기";
}
