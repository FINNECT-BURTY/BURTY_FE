"use client";

import { useState } from "react";

/** 탈퇴 확인 문구. 눌러서 넘길 수 없게 직접 입력하게 한다. */
const CONFIRM_PHRASE = "탈퇴";

/**
 * 회원 탈퇴.
 *
 * <p>되돌릴 수 없고 생체인증(LEVEL_3)이 필요하다. 버튼 하나로 끝나지 않게 확인 문구
 * 입력을 요구한다 — 확인 모달만 두면 습관적으로 눌러 넘기는 동작이 된다.
 */
export function WithdrawSection({
  isSubmitting,
  onWithdraw,
}: Readonly<{
  isSubmitting: boolean;
  onWithdraw: (reason: string) => void;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");

  const canSubmit = confirmText.trim() === CONFIRM_PHRASE && !isSubmitting;

  if (!isOpen) {
    return (
      <button
        className="text-body-md mt-2 w-full rounded-2xl border border-grayscale-200 py-3 text-grayscale-700"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        회원 탈퇴
      </button>
    );
  }

  return (
    <section className="mt-2 rounded-2xl border border-red bg-background px-5 py-5">
      <h3 className="text-title-sm text-grayscale-1000">회원 탈퇴</h3>

      <p className="text-body-md mt-2 text-grayscale-800">
        이름·전화번호 같은 직접 식별정보는 즉시 파기됩니다.
      </p>
      {/*
        보존의무를 미리 알린다. 탈퇴하면 모든 기록이 사라진다고 알고 눌렀다가
        나중에 남아 있는 것을 발견하면 서비스를 신뢰할 수 없게 된다.
      */}
      <p className="text-body-md mt-1 text-grayscale-700">
        다만 이체·거래 기록은 전자금융거래법상 보존의무가 있어 보존기간이 지난 뒤
        자동으로 파기됩니다.
      </p>

      <label
        className="text-caption mt-4 block text-grayscale-700"
        htmlFor="withdraw-reason"
      >
        떠나시는 이유 (선택)
      </label>
      <input
        className="text-body-md mt-1 h-11 w-full rounded-xl border border-grayscale-200 bg-background px-3 text-grayscale-1000"
        id="withdraw-reason"
        maxLength={200}
        onChange={(event) => setReason(event.target.value)}
        placeholder="남겨주시면 개선에 참고할게요"
        value={reason}
      />

      <label
        className="text-caption mt-4 block text-grayscale-700"
        htmlFor="withdraw-confirm"
      >
        확인을 위해 <b className="text-grayscale-1000">{CONFIRM_PHRASE}</b> 를
        입력해 주세요
      </label>
      <input
        autoComplete="off"
        className="text-body-md mt-1 h-11 w-full rounded-xl border border-grayscale-200 bg-background px-3 text-grayscale-1000"
        id="withdraw-confirm"
        onChange={(event) => setConfirmText(event.target.value)}
        value={confirmText}
      />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          className="text-title-sm flex h-12 items-center justify-center rounded-2xl bg-grayscale-200 text-grayscale-700"
          onClick={() => {
            setIsOpen(false);
            setConfirmText("");
          }}
          type="button"
        >
          취소
        </button>
        <button
          className="text-title-sm flex h-12 items-center justify-center rounded-2xl bg-red text-background disabled:bg-grayscale-200 disabled:text-grayscale-700"
          disabled={!canSubmit}
          onClick={() => onWithdraw(reason.trim() || "USER_REQUEST")}
          type="button"
        >
          {isSubmitting ? "처리 중" : "탈퇴하기"}
        </button>
      </div>
    </section>
  );
}
