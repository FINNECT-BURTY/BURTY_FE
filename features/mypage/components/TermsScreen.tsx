"use client";

import { useState } from "react";

import { type TermsDocument,termsDocuments } from "@/features/mypage/api/terms";
import { SettingsScreenShell } from "@/features/mypage/ui/SettingsScreenShell";
import { AgreementMarkdown } from "@/features/onboarding";

/**
 * 가입 후 약관·정책 열람.
 *
 * <p>약관 원문은 온보딩의 동의 화면에만 있었다. 가입이 끝나면 돌아갈 수 없어, 사용자가
 * 자기가 무엇에 동의했는지 확인할 방법이 없었다.
 *
 * <p>여기서는 동의를 받지 않는다. 철회는 별도 화면(개인정보)에서 한다.
 */
export function TermsScreen() {
  const documents = termsDocuments();
  const [selected, setSelected] = useState<TermsDocument | null>(null);

  if (selected) {
    return (
      <SettingsScreenShell
        hasError={false}
        isEmpty={false}
        isInitialLoading={false}
        onRetry={() => setSelected(null)}
        title={selected.title}
      >
        <button
          className="text-body-md mb-4 text-grayscale-700 underline"
          onClick={() => setSelected(null)}
          type="button"
        >
          목록으로
        </button>
        <AgreementMarkdown content={selected.content} />
      </SettingsScreenShell>
    );
  }

  return (
    <SettingsScreenShell
      description="가입할 때 동의한 약관과 정책이에요. 언제든 다시 볼 수 있어요."
      hasError={false}
      isEmpty={documents.length === 0}
      isInitialLoading={false}
      onRetry={() => setSelected(null)}
      title="약관 및 정책"
    >
      <ul className="space-y-3">
        {documents.map((doc) => (
          <li key={doc.id}>
            <button
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-grayscale-100 bg-background px-5 py-5 text-left active:bg-grayscale-100"
              onClick={() => setSelected(doc)}
              type="button"
            >
              <span className="text-title-sm min-w-0 truncate text-grayscale-1000">
                {doc.title}
              </span>
              <span className="text-caption shrink-0 text-grayscale-600">
                {doc.required ? "필수" : "선택"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </SettingsScreenShell>
  );
}
