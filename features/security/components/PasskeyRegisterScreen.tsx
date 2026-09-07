"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  describePasskeyError,
  isPasskeySupported,
  registerPasskey,
} from "@/features/security/api/passkey";
import { useCurrentUser } from "@/shared/auth/currentUser";
import { Header, HeaderBackButton } from "@/shared/layout/Header";
import { BottomActionBar } from "@/shared/ui/BottomActionBar";

type Phase = "idle" | "checking" | "registering" | "done";

/**
 * 패스키 등록.
 *
 * <p>이체는 LEVEL_3 다. 패스키가 없으면 이체 직전 단계 인증에서 막힌다. 이 화면은 그 막힘을
 * 미리 푸는 자리다 — 돈을 보내려는 순간에 등록까지 하게 만들면 사용자는 둘 다 실패한다.
 */
export function PasskeyRegisterScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();

  const [phase, setPhase] = useState<Phase>("checking");
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void isPasskeySupported().then((supported) => {
      if (cancelled) return;
      setIsSupported(supported);
      setPhase("idle");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRegister = async () => {
    if (phase === "registering") return;

    setPhase("registering");
    setError(null);

    try {
      await registerPasskey(user.userId ?? "", user.displayName ?? "BURTY 사용자");
      setPhase("done");
    } catch (cause) {
      setError(describePasskeyError(cause));
      setPhase("idle");
    }
  };

  if (phase === "done") {
    return <PasskeyDone onDone={() => router.replace("/mypage/security")} />;
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <Header
        leftSlot={<HeaderBackButton onClick={() => router.back()} />}
        rightSlot={<div aria-hidden="true" className="size-10" />}
        title="패스키 등록"
      />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-4">
        <h1 className="text-title-lg text-grayscale-1000">
          비밀번호 없이
          <br />
          안전하게 확인해요
        </h1>
        <p className="text-body-lg mt-3 text-grayscale-800">
          이 기기의 지문·얼굴 인식으로 본인을 확인해요. 비밀번호를 외우거나 입력할
          필요가 없어요.
        </p>

        <ul className="mt-7 space-y-3">
          <Point
            description="지문이나 얼굴 정보는 이 기기 안에만 있어요. 서버로 보내지 않아요."
            title="생체 정보는 기기 밖으로 나가지 않아요"
          />
          <Point
            description="돈을 보낼 때마다 이 기기에서 한 번 더 확인해요."
            title="이체할 때 본인 확인에 쓰여요"
          />
          <Point
            description="언제든 보안 설정에서 등록을 해제할 수 있어요."
            title="원하면 해제할 수 있어요"
          />
        </ul>

        {/*
          지원하지 않는 기기에서 버튼을 눌러 보고서야 알게 하지 않는다.
          먼저 알리고, 대신 할 수 있는 것을 안내한다.
        */}
        {!isSupported && phase !== "checking" ? (
          <p
            className="text-body-md mt-6 rounded-2xl border border-grayscale-200 bg-background px-5 py-4 text-grayscale-800"
            role="status"
          >
            이 기기에서는 패스키를 쓸 수 없어요. 지문이나 얼굴 인식을 지원하는
            휴대폰에서 등록해 주세요.
          </p>
        ) : null}

        {error ? (
          <p className="text-body-md mt-4 text-red" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      <BottomActionBar
        actionLabel={phase === "registering" ? "등록 중..." : "패스키 등록하기"}
        actionTextStyle="title-sm"
        bottomSpacing="compact"
        className="shrink-0 bg-background"
        disabled={!isSupported || phase === "checking" || phase === "registering"}
        onAction={() => void handleRegister()}
      />
    </main>
  );
}

function PasskeyDone({ onDone }: Readonly<{ onDone: () => void }>) {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
      <Header
        leftSlot={<div aria-hidden="true" className="size-10" />}
        rightSlot={<div aria-hidden="true" className="size-10" />}
        title="패스키 등록"
      />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pt-10 text-center">
        <Image
          alt=""
          aria-hidden="true"
          className="mx-auto"
          height={48}
          priority
          src="/icons/main/money.svg"
          width={48}
        />
        <h1 className="text-title-lg mt-4 text-green">패스키를 등록했어요</h1>
        <p className="text-body-lg mt-2 text-grayscale-900">
          이제 이체할 때 이 기기로 본인 확인을 할 수 있어요
        </p>
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

function Point({
  description,
  title,
}: Readonly<{ description: string; title: string }>) {
  return (
    <li className="rounded-2xl border border-grayscale-100 bg-background px-5 py-4">
      <p className="text-title-sm text-grayscale-1000">{title}</p>
      <p className="text-body-md mt-1 text-grayscale-700">{description}</p>
    </li>
  );
}
