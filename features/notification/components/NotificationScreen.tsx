"use client";

import { useRouter } from "next/navigation";

import { Header, HeaderBackButton } from "@/shared/layout/Header";

type NotificationItem = Readonly<{
  category: string;
  message: string;
  muted?: boolean;
  time: string;
}>;

const newNotifications: readonly NotificationItem[] = [
  {
    category: "마감 D-3",
    message: "주거 지원이 3일 남았어요",
    time: "11:00",
  },
  {
    category: "위험 발생",
    message: "7일 뒤 위험이 발생해요",
    time: "3일 전",
  },
  {
    category: "결제일 D-3",
    message: "3일 뒤 카드 결제일이에요",
    time: "3일 전",
  },
];

const previousNotifications: readonly NotificationItem[] = [
  {
    category: "위험 발생",
    message: "7일 뒤 위험이 발생해요",
    muted: true,
    time: "3일 전",
  },
  {
    category: "결제일 D-3",
    message: "3일 뒤 카드 결제일이에요",
    muted: true,
    time: "3일 전",
  },
];

type NotificationListVariant = "new" | "previous";

const notificationItemClassNames: Record<NotificationListVariant, string> = {
  new: "bg-background shadow-1 border border-grayscale-100",
  previous: "bg-main-background border border-grayscale-100",
};

function NotificationList({
  items,
  variant,
}: Readonly<{
  items: readonly NotificationItem[];
  variant: NotificationListVariant;
}>) {
  return (
    <ul className="mt-2 space-y-2">
      {items.map((item) => (
        <li
          className={`flex items-end justify-between gap-5 rounded-2xl py-5 px-4 ${notificationItemClassNames[variant]}`}
          key={`${item.category}-${item.message}`}
        >
          <div className="min-w-0">
            <p
              className={`text-caption ${
                item.muted ? "text-grayscale-800" : "text-grayscale-1000"
              }`}
            >
              {item.category}
            </p>
            <p
              className={`text-body-md mt-1 truncate ${
                item.muted ? "text-grayscale-800" : "text-grayscale-1000"
              }`}
            >
              {item.message}
            </p>
          </div>
          <time className="text-caption shrink-0 text-grayscale-1000">
            {item.time}
          </time>
        </li>
      ))}
    </ul>
  );
}

export function NotificationScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <Header
        className="!bg-main-background"
        leftSlot={<HeaderBackButton onClick={handleBack} />}
        rightSlot={<div aria-hidden="true" className="size-10" />}
        title="알림"
      />

      <section className="min-h-0 flex-1 overflow-y-auto px-8 pb-12 pt-5">
        <section>
          <h1 className="text-title-sm text-grayscale-1000">새로운 알림</h1>
          <NotificationList items={newNotifications} variant="new" />
        </section>

        <section className="mt-4">
          <h2 className="text-title-sm text-grayscale-1000">지난 알림</h2>
          <NotificationList items={previousNotifications} variant="previous" />
        </section>
      </section>
    </main>
  );
}
