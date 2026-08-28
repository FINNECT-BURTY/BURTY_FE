import { fetchApiList } from "@/shared/api/apiResponse";

/** `GET /api/v1/notifications` — 백엔드 `NotificationResponse`. */
export type NotificationItem = Readonly<{
  notificationId: number;
  notificationType?: string | null;
  channel?: string | null;
  title?: string | null;
  body?: string | null;
  /** 알림을 눌렀을 때 이동할 앱 내 경로. 없으면 이동하지 않는다. */
  deepLink?: string | null;
  status?: string | null;
  sentAt?: string | null;
  readAt?: string | null;
}>;

export function fetchNotifications(): Promise<readonly NotificationItem[]> {
  return fetchApiList<NotificationItem>("/api/v1/notifications");
}

export type NotificationGroups = Readonly<{
  previous: readonly NotificationItem[];
  unread: readonly NotificationItem[];
}>;

/**
 * 읽지 않은 알림과 지난 알림으로 가른다.
 *
 * <p>백엔드는 `readAt` 만 준다. "새 알림" 은 읽지 않은 것으로 정의한다 —
 * 시간으로 자르면 어제 온 안 읽은 위험 알림이 지난 목록으로 밀린다.
 *
 * <p>각 그룹은 최신순으로 정렬한다. 서버 정렬을 신뢰하지 않는다.
 */
export function groupNotifications(
  items: readonly NotificationItem[],
): NotificationGroups {
  const sorted = [...items].sort(
    (a, b) => sentAtMillis(b) - sentAtMillis(a),
  );

  return {
    previous: sorted.filter((item) => Boolean(item.readAt)),
    unread: sorted.filter((item) => !item.readAt),
  };
}

/**
 * 알림 종류를 한글 라벨로.
 *
 * <p>서버가 보내는 코드를 그대로 노출하지 않는다. 모르는 코드는 라벨을 비워
 * 내부 식별자가 화면에 새어나가지 않게 한다.
 */
const typeLabels: Readonly<Record<string, string>> = {
  BUDGET_ALERT: "예산 경고",
  FAMILY_APPROVAL: "보호자 승인",
  POLICY_DEADLINE: "마감 임박",
  RISK_ALERT: "위험 발생",
  SCHEDULE_REMINDER: "일정 알림",
  TRANSFER_COMPLETED: "이체 완료",
};

export function notificationTypeLabel(
  notificationType: string | null | undefined,
): string {
  if (!notificationType) return "";
  return typeLabels[notificationType] ?? "";
}

function sentAtMillis(item: NotificationItem): number {
  if (!item.sentAt) return 0;
  const parsed = new Date(item.sentAt).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}
