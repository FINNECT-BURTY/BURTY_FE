"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import {
  fetchNotifications,
  groupNotifications,
  type NotificationItem,
  notificationTypeLabel,
} from "@/features/notification/api/notifications";
import { useBackendQuery } from "@/shared/hooks/useBackendQuery";
import { Header, HeaderBackButton } from "@/shared/layout/Header";
import { formatRelativeTime } from "@/shared/ui/money";
import { Skeleton } from "@/shared/ui/Skeleton";
import { EmptyState, ErrorState } from "@/shared/ui/StateMessage";

type NotificationListVariant = "previous" | "unread";

const notificationItemClassNames: Record<NotificationListVariant, string> = {
  previous: "bg-main-background border border-grayscale-100",
  unread: "bg-background shadow-1 border border-grayscale-100",
};

export function NotificationScreen() {
  const router = useRouter();

  const fetcher = useCallback(() => fetchNotifications(), []);
  const { data, error, isInitialLoading, refetch } = useBackendQuery(fetcher);

  const { previous, unread } = groupNotifications(data ?? []);
  const isEmpty = !isInitialLoading && previous.length + unread.length === 0;

  const handleBack = () => {
    router.back();
  };

  const handleOpen = (item: NotificationItem) => {
    // 서버가 준 딥링크만 따라간다. 외부 URL 로 나가면 앱 밖으로 새어나간다.
    if (item.deepLink?.startsWith("/")) {
      router.push(item.deepLink);
    }
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <Header
        leftSlot={<HeaderBackButton onClick={handleBack} />}
        rightSlot={<div aria-hidden="true" className="size-10" />}
        title="알림"
      />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-4">
        {isInitialLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                className="rounded-2xl border border-grayscale-100 bg-background px-4 py-5"
                key={index}
              >
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-2 h-4 w-52" />
              </div>
            ))}
          </div>
        ) : error && isEmpty ? (
          <ErrorState message="알림을 불러오지 못했어요" onRetry={refetch} />
        ) : isEmpty ? (
          <EmptyState
            description="위험 예보나 마감 임박 소식이 생기면 알려드릴게요"
            title="아직 받은 알림이 없어요"
          />
        ) : (
          <>
            {unread.length > 0 ? (
              <section>
                <h2 className="text-title-sm text-grayscale-1000">
                  새 알림
                  <span className="text-body-md ml-1.5 text-grayscale-600">
                    {unread.length}
                  </span>
                </h2>
                <NotificationList
                  items={unread}
                  onOpen={handleOpen}
                  variant="unread"
                />
              </section>
            ) : null}

            {previous.length > 0 ? (
              <section className={unread.length > 0 ? "mt-6" : undefined}>
                <h2 className="text-title-sm text-grayscale-1000">지난 알림</h2>
                <NotificationList
                  items={previous}
                  onOpen={handleOpen}
                  variant="previous"
                />
              </section>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}

function NotificationList({
  items,
  onOpen,
  variant,
}: Readonly<{
  items: readonly NotificationItem[];
  onOpen: (item: NotificationItem) => void;
  variant: NotificationListVariant;
}>) {
  const isMuted = variant === "previous";

  return (
    <ul className="mt-2 space-y-2">
      {items.map((item) => {
        const label = notificationTypeLabel(item.notificationType);
        const isLinked = Boolean(item.deepLink?.startsWith("/"));

        return (
          <li key={item.notificationId}>
            {/*
              딥링크가 있을 때만 버튼으로 만든다. 눌러도 아무 일이 없는 버튼은
              스크린리더에서 조작 가능한 요소로 잘못 읽힌다.
            */}
            <Wrapper
              className={`flex w-full items-end gap-3 rounded-2xl px-4 py-5 text-left ${notificationItemClassNames[variant]}`}
              isLinked={isLinked}
              onOpen={() => onOpen(item)}
            >
              {/*
                안 읽은 알림에 점을 찍는다. 배경색 차이만으로는 읽음 여부가
                한눈에 구분되지 않고, 밝기 대비만으로 정보를 전달하면 안 된다.
              */}
              {!isMuted ? (
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-2 shrink-0 self-start rounded-full bg-orange"
                />
              ) : null}

              <span className="min-w-0 flex-1">
                {label ? (
                  <span
                    className={`text-caption block ${
                      isMuted ? "text-grayscale-600" : "text-orange"
                    }`}
                  >
                    {label}
                  </span>
                ) : null}
                <span
                  className={`text-body-lg mt-0.5 block ${
                    isMuted ? "text-grayscale-700" : "text-grayscale-1000"
                  }`}
                >
                  {item.title ?? item.body ?? "새로운 소식이 있어요"}
                </span>
                {item.title && item.body ? (
                  <span className="text-body-md mt-0.5 block text-grayscale-800">
                    {item.body}
                  </span>
                ) : null}
              </span>

              <span className="text-caption shrink-0 text-grayscale-600">
                {item.sentAt ? formatRelativeTime(item.sentAt) : ""}
              </span>
            </Wrapper>
          </li>
        );
      })}
    </ul>
  );
}

function Wrapper({
  children,
  className,
  isLinked,
  onOpen,
}: Readonly<{
  children: React.ReactNode;
  className: string;
  isLinked: boolean;
  onOpen: () => void;
}>) {
  if (!isLinked) {
    return <div className={className}>{children}</div>;
  }

  return (
    <button className={className} onClick={onOpen} type="button">
      {children}
    </button>
  );
}
