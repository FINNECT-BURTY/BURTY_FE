"use client";

import Image from "next/image";
import { useState } from "react";

import { OnboardingExitConfirmModal } from "@/features/onboarding/components/OnboardingExitConfirmModal";
import {
  agreementContents,
  type AgreementId,
  agreementItems,
  type AgreementView,
  type OnboardingAgreementScreenProps,
} from "@/features/onboarding/constants/agreements";
import { AgreementMarkdown } from "@/features/onboarding/ui/AgreementMarkdown";
import { OnboardingHeader } from "@/shared/layout/OnboardingHeader";
import { BottomActionBar } from "@/shared/ui/BottomActionBar";

function getAgreementDetailTitle(label: string) {
  return label.replace(/^\((필수|선택)\)\s*/, "");
}

function createInitialAgreementState() {
  return Object.fromEntries(
    agreementItems.map((item) => [item.id, false]),
  ) as Record<AgreementId, boolean>;
}

function CheckIcon({ checked }: Readonly<{ checked: boolean }>) {
  return (
    <span
      className={`flex size-6 shrink-0 items-center justify-center rounded ${
        checked ? "bg-yellow-400" : "bg-grayscale-200"
      }`}
    >
      <Image
        alt=""
        aria-hidden="true"
        className="brightness-0 invert"
        height={24}
        src="/icons/onboarding/checkmark.svg"
        width={24}
      />
    </span>
  );
}

function RowCheckIcon({ checked }: Readonly<{ checked: boolean }>) {
  return (
    <span
      className={`w-6 shrink-0 ${checked ? "[filter:brightness(0)_saturate(100%)_invert(88%)_sepia(48%)_saturate(676%)_hue-rotate(351deg)_brightness(99%)_contrast(93%)]" : ""}`}
      aria-hidden="true"
    >
      <Image
        alt=""
        aria-hidden="true"
        height={24}
        src="/icons/onboarding/checkmark.svg"
        width={24}
      />
    </span>
  );
}

export function OnboardingAgreementScreen({
  onBackToEntry,
  onComplete,
}: OnboardingAgreementScreenProps) {
  const [agreements, setAgreements] = useState(createInitialAgreementState);
  const [view, setView] = useState<AgreementView>({ type: "list" });
  const [showExitDialog, setShowExitDialog] = useState(false);

  const allChecked = agreementItems.every((item) => agreements[item.id]);
  const requiredChecked = agreementItems
    .filter((item) => item.required)
    .every((item) => agreements[item.id]);

  const handleToggleAll = () => {
    const nextChecked = !allChecked;

    setAgreements(
      Object.fromEntries(
        agreementItems.map((item) => [item.id, nextChecked]),
      ) as Record<AgreementId, boolean>,
    );
  };

  const handleToggle = (id: AgreementId) => {
    setAgreements((currentAgreements) => ({
      ...currentAgreements,
      [id]: !currentAgreements[id],
    }));
  };

  if (view.type === "detail") {
    return (
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
        <OnboardingHeader
          onBack={() => setView({ type: "list" })}
          title="약관 동의"
        />
        <section className="min-h-0 flex-1 overflow-y-auto px-6 mt-2 pb-6">
          <h1 className="text-title-sm text-grayscale-1000">
            {getAgreementDetailTitle(view.item.label)}
          </h1>
          <AgreementMarkdown content={agreementContents[view.item.id]} />
        </section>
        <BottomActionBar
          actionLabel="확인"
          actionTextStyle="title-sm"
          onAction={() => setView({ type: "list" })}
        />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
      <OnboardingHeader onBack={() => setShowExitDialog(true)} title="약관 동의" />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-8">
        <h1 className="text-title-lg text-grayscale-1000">
          안녕하세요!
          <br />
          버티와 함께 하는걸 환영해요.
        </h1>
        <p className="text-body-md mt-3 text-grayscale-900">
          돈 흐름을 안전하게 분석하기 위해 필요한 항목만 확인할게요
        </p>

        <button
          className="mt-8 flex items-center gap-3 text-left"
          onClick={handleToggleAll}
          type="button"
        >
          <CheckIcon checked={allChecked} />
          <span className="text-title-sm text-grayscale-1000">
            약관 전체 동의하기
          </span>
        </button>

        <section className="mt-4 flex flex-col gap-4">
          {agreementItems.map((item, index) => (
            <div key={item.id}>
              {index === 4 ? <div className="my-1 h-px bg-grayscale-100 mb-4" /> : null}
              <div className="flex items-center gap-4">
                <button
                  aria-label={`${item.label} 선택`}
                  className="flex items-center"
                  onClick={() => handleToggle(item.id)}
                  type="button"
                >
                  <RowCheckIcon checked={agreements[item.id]} />
                </button>
                <div className="flex min-w-0 flex-1 items-center justify-between gap-4 text-left">
                  <span>
                    <span className="text-body-md block text-grayscale-1000">
                      {item.label}
                    </span>
                    {item.description ? (
                      <span className="text-caption block text-grayscale-800">
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                  <button
                    aria-label={`${item.label} 자세히 보기`}
                    className="flex shrink-0 items-center justify-center"
                    onClick={() => setView({ type: "detail", item })}
                    type="button"
                  >
                    <Image
                      alt=""
                      aria-hidden="true"
                      height={20}
                      src="/icons/onboarding/arrow-right.svg"
                      width={20}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </section>

      <BottomActionBar
        actionLabel="동의하기"
        disabled={!requiredChecked}
        onAction={onComplete}
      />

      {showExitDialog ? (
        <OnboardingExitConfirmModal
          onPrimary={() => setShowExitDialog(false)}
          onSecondary={onBackToEntry}
          primaryLabel="계속 작성하기"
          secondaryLabel="나가기"
          title={"아직 회원 가입이 완료되지 않았어요\n지금 나가면 정보가 작성 중이던 사라져요"}
        />
      ) : null}
    </main>
  );
}
