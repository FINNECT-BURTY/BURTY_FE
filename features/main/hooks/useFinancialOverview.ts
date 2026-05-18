"use client";

import { useEffect, useMemo, useState } from "react";

import { getCurrentAuthUser } from "@/shared/api/authSession";
import { burtyApi, type ActionRecommendationPayload, type JsonRecord } from "@/shared/api/burtyApi";

export type ScheduleType = "income" | "expense";

export type FinanceSchedule = Readonly<{
  id: string;
  title: string;
  dateLabel: string;
  amount: number;
  type: ScheduleType;
  risky?: boolean;
}>;

export type RiskCause = Readonly<{
  label: string;
  amount: number;
}>;

export type GrantPolicy = Readonly<{
  id: string;
  title: string;
  description: string;
  deadline: string;
  tags: string[];
  category: "housing" | "finance" | "living";
}>;

export type NotificationItem = Readonly<{
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  section: "new" | "past";
}>;

export type FinancialOverview = Readonly<{
  userId: string;
  displayName: string;
  riskTitle: string;
  riskSubtitle: string;
  schedules: FinanceSchedule[];
  causes: RiskCause[];
  explanation: string;
  warning: string;
  action: ActionRecommendationPayload;
  policies: GrantPolicy[];
  notifications: NotificationItem[];
}>;

const fallbackOverview: FinancialOverview = {
  userId: "0",
  displayName: "00",
  riskTitle: "00님 예상 위험이 있어요",
  riskSubtitle: "25일에 -12,000원이 부족할 예정이에요",
  schedules: [
    { id: "salary-1", title: "급여일", dateLabel: "3.7", amount: 250000, type: "income" },
    { id: "card-1", title: "카드값", dateLabel: "3.7", amount: -250000, type: "expense" },
    { id: "rent-1", title: "월세", dateLabel: "3.16", amount: -250000, type: "expense", risky: true },
    { id: "interest-1", title: "이자", dateLabel: "3.18", amount: 300, type: "income" },
  ],
  causes: [
    { label: "카드값", amount: -80000 },
    { label: "월세", amount: -80000 },
    { label: "기타 고정비", amount: -80000 },
  ],
  explanation:
    "카드값과 월세가 같은 주에 빠져나가면서 부족이 발생합니다. 25일은 지출이 집중되는 날입니다.",
  warning:
    "이 상태로는 결제 실패 가능성이 있어요. 연체 수수료가 발생할 수 있으니 주의하세요.",
  action: {
    actionType: "CHANGE_PAYMENT_DATE",
    title: "00님 지금 필요한 솔루션이 있어요",
    description: "50,000원을 확보할 수 있어요",
    estimatedImprovement: 50000,
    priorityScore: 100,
  },
  policies: [
    {
      id: "housing-main",
      title: "주거 지원",
      description: "청년 전세 자금 대출 이자 지원",
      deadline: "마감 2026.04.23.",
      tags: ["#주거지원", "#청년월세지원", "#월20만원"],
      category: "housing",
    },
    {
      id: "finance-main",
      title: "금융 지원",
      description: "청년 전세 자금 대출 이자 지원",
      deadline: "마감 2026.04.23.",
      tags: ["#금융", "#대출이자"],
      category: "finance",
    },
    {
      id: "living-main",
      title: "생활비 지원",
      description: "소득 구간별 생활 안정 지원",
      deadline: "마감 2026.05.18.",
      tags: ["#생활비", "#청년지원"],
      category: "living",
    },
  ],
  notifications: [
    {
      id: "new-policy",
      title: "마감 D-3",
      body: "주거 지원이 3일 남았어요",
      timeLabel: "11:00",
      section: "new",
    },
    {
      id: "new-risk",
      title: "위험 발생",
      body: "7일 뒤 위험이 발생해요",
      timeLabel: "3일 전",
      section: "new",
    },
    {
      id: "new-card",
      title: "결제일 D-3",
      body: "3일 뒤 카드 결제일이에요",
      timeLabel: "3일 전",
      section: "new",
    },
    {
      id: "past-risk",
      title: "위험 발생",
      body: "7일 뒤 위험이 발생해요",
      timeLabel: "3일 전",
      section: "past",
    },
    {
      id: "past-card",
      title: "결제일 D-3",
      body: "3일 뒤 카드 결제일이에요",
      timeLabel: "3일 전",
      section: "past",
    },
  ],
};

function asRecord(value: unknown): JsonRecord {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonRecord;
  }
  return {};
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function numberValue(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function mapSchedule(item: unknown, index: number): FinanceSchedule {
  const record = asRecord(item);
  const title = stringValue(record.label ?? record.title ?? record.merchant, fallbackOverview.schedules[index % fallbackOverview.schedules.length].title);
  const amount = numberValue(record.amount, fallbackOverview.schedules[index % fallbackOverview.schedules.length].amount);
  const type = amount > 0 ? "income" : "expense";
  return {
    id: stringValue(record.scheduleId ?? record.txId, `schedule-${index}`),
    title,
    dateLabel: stringValue(record.dateLabel ?? record.txnDate, fallbackOverview.schedules[index % fallbackOverview.schedules.length].dateLabel),
    amount,
    type,
    risky: Boolean(record.risky),
  };
}

export function useFinancialOverview() {
  const [overview, setOverview] = useState<FinancialOverview>(fallbackOverview);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const user = await getCurrentAuthUser();
        if (!user) return;

        const [risk, action, schedules, policies, notifications, causes] =
          await Promise.allSettled([
            burtyApi.cashflow.risk(user.userId),
            burtyApi.cashflow.action(user.userId),
            burtyApi.cashflow.schedules(user.userId),
            burtyApi.policy.matches(user.userId),
            burtyApi.notifications.list(user.userId),
            burtyApi.cashflow.riskCauses(user.userId),
          ]);

        if (!active) return;

        const riskData = risk.status === "fulfilled" ? risk.value : null;
        const actionData = action.status === "fulfilled" ? action.value : fallbackOverview.action;
        const scheduleData =
          schedules.status === "fulfilled" && schedules.value.length > 0
            ? schedules.value.map(mapSchedule)
            : fallbackOverview.schedules;
        const policyData =
          policies.status === "fulfilled" && policies.value.length > 0
            ? policies.value.map((policy, index) => ({
                id: policy.policyId,
                title: policy.policyName,
                description: policy.reason,
                deadline: "마감 2026.04.23.",
                tags: [`#${policy.supportType}`],
                category: index % 2 === 0 ? "housing" : "finance",
              } satisfies GrantPolicy))
            : fallbackOverview.policies;
        const notificationData =
          notifications.status === "fulfilled" && notifications.value.length > 0
            ? notifications.value.map((notification, index) => ({
                id: notification.notificationId,
                title: notification.title,
                body: notification.body,
                timeLabel: index === 0 ? "11:00" : "3일 전",
                section: index < 3 ? "new" : "past",
              } satisfies NotificationItem))
            : fallbackOverview.notifications;
        const causeData =
          causes.status === "fulfilled" && causes.value.length > 0
            ? causes.value.map((cause, index) => {
                const record = asRecord(cause);
                return {
                  label: stringValue(record.label ?? record.cause, fallbackOverview.causes[index % fallbackOverview.causes.length].label),
                  amount: numberValue(record.amount, fallbackOverview.causes[index % fallbackOverview.causes.length].amount),
                };
              })
            : fallbackOverview.causes;

        setOverview({
          ...fallbackOverview,
          userId: user.userId,
          displayName: user.userId.padStart(2, "0"),
          riskTitle: `${user.userId.padStart(2, "0")}님 예상 위험이 있어요`,
          riskSubtitle: riskData?.riskDate
            ? `${riskData.riskDate}에 ${riskData.projectedBalance.toLocaleString("ko-KR")}원이 부족할 예정이에요`
            : fallbackOverview.riskSubtitle,
          schedules: scheduleData,
          causes: causeData,
          explanation: riskData?.reason ?? fallbackOverview.explanation,
          warning: riskData?.level ? `${riskData.level} 단계 위험이 감지됐어요. 결제 실패 가능성을 확인해 주세요.` : fallbackOverview.warning,
          action: {
            ...actionData,
            title: `${user.userId.padStart(2, "0")}님 지금 필요한 솔루션이 있어요`,
          },
          policies: policyData,
          notifications: notificationData,
        });
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => ({ loading, overview }), [loading, overview]);
}
