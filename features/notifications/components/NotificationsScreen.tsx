"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { useFinancialOverview, type NotificationItem } from "@/features/main/hooks/useFinancialOverview";

function NotificationRow({ item }: Readonly<{ item: NotificationItem }>) {
  return (
    <div className="flex items-start justify-between gap-5 py-5">
      <div className="min-w-0">
        <p className="text-caption text-grayscale-800">{item.title}</p>
        <p className="text-body-md mt-2 text-grayscale-1000">{item.body}</p>
      </div>
      <time className="text-caption shrink-0 pt-7 text-grayscale-900">
        {item.timeLabel}
      </time>
    </div>
  );
}

export function NotificationsScreen() {
  const router = useRouter();
  const { overview } = useFinancialOverview();
  const newItems = overview.notifications.filter((item) => item.section === "new");
  const pastItems = overview.notifications.filter((item) => item.section === "past");

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
      <header className="flex h-16 shrink-0 items-center px-5">
        <button
          aria-label="뒤로가기"
          className="-ml-2 flex size-10 items-center justify-center text-grayscale-1000"
          onClick={() => router.back()}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={24} strokeWidth={1.8} />
        </button>
        <div className="text-title-md min-w-0 flex-1 pr-10 text-center">알림</div>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <h1 className="text-title-sm mt-2 text-grayscale-1000">새로운 알림</h1>
        <div className="mt-5">
          {newItems.map((item) => (
            <NotificationRow item={item} key={item.id} />
          ))}
        </div>

        <h2 className="text-title-sm mt-8 text-grayscale-1000">지난 알림</h2>
        <div className="mt-5">
          {pastItems.map((item) => (
            <NotificationRow item={item} key={item.id} />
          ))}
        </div>
      </section>
    </main>
  );
}
