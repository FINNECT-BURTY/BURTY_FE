import { describe, expect, it } from "vitest";

import type { NotificationItem } from "@/features/notification/api/notifications";
import { groupNotifications, notificationTypeLabel } from "@/features/notification/api/notifications";

function item(overrides: Partial<NotificationItem> = {}): NotificationItem {
  return {
    notificationId: 1,
    notificationType: "RISK_ALERT",
    title: "알림",
    sentAt: "2026-08-28T12:00:00",
    readAt: null,
    ...overrides,
  };
}

describe("groupNotifications", () => {
  it("읽음 여부로 가른다 — 시간으로 자르면 어제 온 안 읽은 위험 알림이 지난 목록으로 밀린다", () => {
    const old = item({ notificationId: 1, sentAt: "2026-08-20T12:00:00", readAt: null });
    const recentRead = item({
      notificationId: 2,
      sentAt: "2026-08-28T11:00:00",
      readAt: "2026-08-28T11:05:00",
    });

    const { previous, unread } = groupNotifications([old, recentRead]);

    expect(unread.map((n) => n.notificationId)).toEqual([1]);
    expect(previous.map((n) => n.notificationId)).toEqual([2]);
  });

  it("각 그룹을 최신순으로 정렬한다 — 서버 정렬을 신뢰하지 않는다", () => {
    const items = [
      item({ notificationId: 1, sentAt: "2026-08-20T12:00:00" }),
      item({ notificationId: 2, sentAt: "2026-08-28T12:00:00" }),
      item({ notificationId: 3, sentAt: "2026-08-24T12:00:00" }),
    ];

    expect(groupNotifications(items).unread.map((n) => n.notificationId)).toEqual([2, 3, 1]);
  });

  it("sentAt 이 없어도 깨지지 않는다", () => {
    const items = [item({ notificationId: 1, sentAt: null }), item({ notificationId: 2 })];
    expect(groupNotifications(items).unread).toHaveLength(2);
  });

  it("빈 목록에서 깨지지 않는다", () => {
    expect(groupNotifications([])).toEqual({ previous: [], unread: [] });
  });
});

describe("notificationTypeLabel", () => {
  it("알려진 코드를 한글로 바꾼다", () => {
    expect(notificationTypeLabel("RISK_ALERT")).toBe("위험 발생");
    expect(notificationTypeLabel("POLICY_DEADLINE")).toBe("마감 임박");
  });

  it("모르는 코드는 빈 문자열로 둔다 — 내부 식별자가 화면에 새어나가면 안 된다", () => {
    expect(notificationTypeLabel("SOME_INTERNAL_CODE")).toBe("");
    expect(notificationTypeLabel(null)).toBe("");
    expect(notificationTypeLabel(undefined)).toBe("");
  });
});
