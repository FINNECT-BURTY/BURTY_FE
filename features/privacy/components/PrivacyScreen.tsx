"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  exportPersonalData,
  type ExportSection,
  RECTIFIABLE_FIELDS,
  rectifyPersonalData,
  requestLevel2Proof,
  toExportSections,
  withdrawAccount,
  type WithdrawResult,
} from "@/features/privacy/api/privacy";
import { ExportSectionView } from "@/features/privacy/components/ExportSectionView";
import { WithdrawSection } from "@/features/privacy/components/WithdrawSection";
import { describeStepUpError, stepUpWithBiometrics } from "@/features/security";
import { describeApiError } from "@/shared/api/apiResponse";
import { useCurrentUser } from "@/shared/auth/currentUser";
import { clearAuthTokens, clearSessionMarker } from "@/shared/auth/tokenStorage";
import { Header, HeaderBackButton } from "@/shared/layout/Header";
import { Skeleton } from "@/shared/ui/Skeleton";

type Busy = "export" | "rectify" | "withdraw" | null;

export function PrivacyScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();

  const [sections, setSections] = useState<readonly ExportSection[] | null>(null);
  const [rawExport, setRawExport] = useState<unknown>(null);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [withdrawn, setWithdrawn] = useState<WithdrawResult | null>(null);

  const run = async (kind: Exclude<Busy, null>, action: () => Promise<void>) => {
    setBusy(kind);
    setError(null);
    setMessage(null);
    try {
      await action();
    } catch (caught) {
      setError(
        caught instanceof Error && caught.name === "StepUpError"
          ? describeStepUpError(caught)
          : describeApiError(caught),
      );
    } finally {
      setBusy(null);
    }
  };

  const handleExport = () =>
    void run("export", async () => {
      const proof = await requestLevel2Proof();
      const data = await exportPersonalData(proof);
      setRawExport(data);
      setSections(toExportSections(data));
    });

  const handleRectify = () =>
    void run("rectify", async () => {
      const proof = await requestLevel2Proof();
      await rectifyPersonalData(proof, "name", newName.trim());
      setNewName("");
      setMessage("이름을 바꿨어요");
      // 정정 결과가 열람 화면에 그대로 남아 있으면 옛 값을 계속 보게 된다.
      setSections(null);
      setRawExport(null);
    });

  const handleWithdraw = (reason: string) =>
    void run("withdraw", async () => {
      // 탈퇴는 LEVEL_3 이라 생체인증을 거친다. 열람·정정과 달리 되돌릴 수 없다.
      const stepUp = await stepUpWithBiometrics(user.userId ?? "");
      const result = await withdrawAccount(stepUp.riskProof, reason);
      setWithdrawn(result ?? {});
      // 계정이 사라졌으므로 이 기기의 인증 흔적도 남기지 않는다.
      clearAuthTokens();
      clearSessionMarker();
    });

  const handleDownload = () => {
    if (rawExport === null) return;
    // 화면 요약만으로는 열람권을 다 채우지 못한다. 원본을 그대로 가져갈 수 있게 한다.
    const blob = new Blob([JSON.stringify(rawExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.download = "burty-personal-data.json";
    anchor.href = url;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (withdrawn) {
    return (
      <WithdrawnView
        onLeave={() => router.replace("/onboarding")}
        result={withdrawn}
      />
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <Header
        leftSlot={<HeaderBackButton onClick={() => router.back()} />}
        rightSlot={<div aria-hidden="true" className="size-10" />}
        title="내 개인정보"
      />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-4">
        <p className="text-body-md text-grayscale-700">
          서비스가 가지고 있는 내 정보를 확인하고, 고치거나 지울 수 있어요.
        </p>

        <h2 className="text-title-sm mt-6 text-grayscale-1000">정보 열람</h2>
        <button
          className="text-title-sm mt-2 h-12 w-full rounded-2xl bg-yellow-400 text-grayscale-1000 disabled:bg-grayscale-200 disabled:text-grayscale-700"
          disabled={busy !== null}
          onClick={handleExport}
          type="button"
        >
          {busy === "export" ? "불러오는 중" : "내 정보 보기"}
        </button>

        {busy === "export" ? (
          <div className="mt-3 space-y-2">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                className="rounded-2xl border border-grayscale-100 bg-background px-5 py-4"
                key={index}
              >
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-2 h-3 w-full" />
              </div>
            ))}
          </div>
        ) : null}

        {sections ? (
          <div className="mt-3 space-y-2">
            {sections.map((section) => (
              <ExportSectionView key={section.key} section={section} />
            ))}
            <button
              className="text-body-md w-full rounded-2xl border border-grayscale-200 py-3 text-grayscale-800"
              onClick={handleDownload}
              type="button"
            >
              전체 내려받기 (JSON)
            </button>
          </div>
        ) : null}

        <h2 className="text-title-sm mt-6 text-grayscale-1000">정보 정정</h2>
        <p className="text-body-md mt-1 text-grayscale-700">
          전화번호·생년월일처럼 본인확인이 필요한 정보는 본인확인 절차를 거쳐야
          바꿀 수 있어요.
        </p>
        <label
          className="text-caption mt-3 block text-grayscale-700"
          htmlFor="rectify-name"
        >
          {RECTIFIABLE_FIELDS[0].label}
        </label>
        <input
          className="text-body-md mt-1 h-11 w-full rounded-xl border border-grayscale-200 bg-background px-3 text-grayscale-1000"
          id="rectify-name"
          maxLength={100}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="새 이름"
          value={newName}
        />
        <button
          className="text-body-md mt-2 h-11 w-full rounded-xl border border-grayscale-200 text-grayscale-800 disabled:text-grayscale-400"
          disabled={busy !== null || newName.trim().length === 0}
          onClick={handleRectify}
          type="button"
        >
          {busy === "rectify" ? "저장 중" : "이름 바꾸기"}
        </button>

        <h2 className="text-title-sm mt-6 text-grayscale-1000">정보 파기</h2>
        <WithdrawSection
          isSubmitting={busy === "withdraw"}
          onWithdraw={handleWithdraw}
        />

        {message ? (
          <p className="text-body-md mt-3 text-green" role="status">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="text-body-md mt-3 text-red" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    </main>
  );
}

function WithdrawnView({
  onLeave,
  result,
}: Readonly<{ onLeave: () => void; result: WithdrawResult }>) {
  return (
    <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 bg-main-background px-8 text-center">
      <h1 className="text-title-md text-grayscale-1000">
        탈퇴가 처리되었어요
      </h1>
      <p className="text-body-md text-grayscale-800">
        {result.note ??
          "직접 식별정보는 즉시 파기되었습니다."}
      </p>
      {result.retentionUntil && result.retentionUntil !== "null" ? (
        <p className="text-caption text-grayscale-600">
          법정 보존 기록은 {result.retentionUntil} 이후 자동 파기됩니다
        </p>
      ) : null}
      <button
        className="text-title-sm mt-4 h-12 w-full max-w-[280px] rounded-2xl bg-yellow-400 text-grayscale-1000"
        onClick={onLeave}
        type="button"
      >
        확인
      </button>
    </main>
  );
}
