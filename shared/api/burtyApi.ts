import { backendFetch } from "@/shared/api/backendFetch";

export type ApiResponse<T> = Readonly<{
  success: boolean;
  message?: string;
  data: T;
  errorCode?: string | null;
}>;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonRecord = Record<string, JsonValue>;

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

function withQuery(path: string, params?: QueryParams) {
  if (!params) return path;
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

async function apiData<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await backendFetch(path, init);
  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || payload?.success !== true) {
    throw new Error(payload?.message || "BURTY API request failed.");
  }

  return payload.data;
}

function jsonInit(method: string, body?: unknown): RequestInit {
  return {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    method,
  };
}

export type SocialProvider = "kakao" | "google" | "naver" | "apple";

export type AuthorizeUrlPayload = Readonly<{
  authorizeUrl: string;
  state?: string;
}>;

export type SocialLoginPayload = Readonly<{
  userId: string;
  provider: string;
  accessToken: string;
  refreshToken: string;
  accessExpiresInSeconds: number;
  refreshExpiresInSeconds: number;
  newUser: boolean;
  profileComplete: boolean;
}>;

export type TokenPairPayload = Readonly<{
  accessToken: string;
  refreshToken: string;
  accessExpiresInSeconds: number;
  refreshExpiresInSeconds: number;
}>;

export type AuthCurrentUserPayload = Readonly<{
  userId: string;
  profileComplete: boolean;
}>;

export type SimpleResultPayload = Readonly<{
  result?: boolean;
  message?: string;
}>;

export type MonthlyReportPayload = Readonly<{
  userId: string;
  month: string;
  easyReadSummary: string;
  signalColor: string;
  primaryAction: string;
  keyPoints: string[];
}>;

export type CashflowForecastPayload = Readonly<{
  userId: string;
  generatedDate: string;
  openingBalance: number;
  minimumBalance: number;
  riskDate?: string | null;
  riskReason?: string | null;
  dailyBalances: JsonValue[];
  safetyBalance: number;
  dataSource: string;
  customCriteriaUsed: boolean;
}>;

export type RiskAssessmentPayload = Readonly<{
  userId: string;
  level: string;
  threshold: number;
  reason: string;
  riskDate?: string | null;
  projectedBalance: number;
}>;

export type ActionRecommendationPayload = Readonly<{
  actionType: string;
  title: string;
  description: string;
  estimatedImprovement: number;
  priorityScore: number;
  advisoryBoundary?: string | null;
}>;

export type PolicyMatchPayload = Readonly<{
  policyId: string;
  policyName: string;
  supportType: string;
  reason: string;
  priorityScore: number;
}>;

export type TransactionPayload = Readonly<{
  txId?: string | null;
  txnDate: string;
  amount: number;
  direction: string;
  merchant?: string | null;
  memo?: string | null;
  expenseCategoryCode?: string | null;
  incomeCategoryCode?: string | null;
  source?: string | null;
  categoryConfidence?: number | null;
}>;

export type CashflowSchedulePayload = Readonly<{
  scheduleId: string;
  scheduleTypeCode: string;
  label: string;
  amount: number;
  direction: string;
  dayOfMonth: number;
  active: boolean;
}>;

export type NotificationPayload = Readonly<{
  notificationId: string;
  notificationType: string;
  channel: string;
  title: string;
  body: string;
  deepLink?: string | null;
  status: string;
  createdAt?: string | null;
}>;

export type DevicePayload = Readonly<{
  deviceId: string;
  deviceName?: string | null;
  platform?: string | null;
  osVersion?: string | null;
  appVersion?: string | null;
  trusted: boolean;
  lastSeenAt?: string | null;
  createdAt?: string | null;
}>;

export type SessionPayload = Readonly<{
  sessionId: string;
  userId: string;
  deviceId?: string | null;
  createdAt?: string | null;
  expiresAt?: string | null;
}>;

export type ConsentPayload = Readonly<{
  consentId: string;
  consentType: string;
  consentVersion: string;
  agreedAt?: string | null;
  revokedAt?: string | null;
}>;

export type PersonaPayload = Readonly<{
  userId: string;
  occupationCode?: string | null;
  residenceCode?: string | null;
  householdType?: string | null;
  monthlyIncomeAvg?: number | null;
  incomeVariabilityPct?: number | null;
  age?: number | null;
  source?: string | null;
  userOverridden?: boolean | null;
  inferredAt?: string | null;
}>;

export const burtyApi = {
  auth: {
    me: () => apiData<AuthCurrentUserPayload>("/api/v1/auth/me"),
    refresh: () => apiData<TokenPairPayload>("/api/v1/auth/refresh", jsonInit("POST", {})),
    logout: () => apiData<{ logout: boolean }>("/api/v1/auth/logout", jsonInit("POST", {})),
    issueTestToken: (userId: string) =>
      apiData<{ token: string }>("/api/v1/auth/token", jsonInit("POST", { userId })),
    demoSession: () => apiData<TokenPairPayload>("/api/v1/auth/demo/session", jsonInit("POST", {})),
  },

  social: {
    authorizeUrl: (provider: SocialProvider, state?: string) =>
      apiData<AuthorizeUrlPayload>(
        withQuery(`/api/v1/auth/${provider}/authorize-url`, { state }),
      ),
    login: (
      provider: SocialProvider,
      body: {
        code: string;
        redirectUri?: string;
        state?: string;
        codeVerifier?: string;
      },
    ) =>
      apiData<SocialLoginPayload>(
        `/api/v1/auth/${provider}/login`,
        jsonInit("POST", body),
      ),
  },

  onboarding: {
    completeProfile: (body: {
      phone: string;
      name: string;
      birthDate: string;
      ageRange?: number;
      uxMode?: "STANDARD" | "SENIOR" | string;
      termsAccepted: boolean;
    }) =>
      apiData<{ completed: boolean; alreadyRegistered: boolean }>(
        "/api/v1/onboarding/profile",
        jsonInit("POST", body),
      ),
  },

  consult: {
    consult: (body: { userId: string; question: string }) =>
      apiData<{ summary: string; signalColor: string; recommendedActions: string[] }>(
        "/api/v1/consult",
        jsonInit("POST", body),
      ),
    aiConsult: (body: { userId: string; question: string }) =>
      apiData<{ summary: string; signalColor: string; recommendedActions: string[] }>(
        "/api/v1/ai/consult",
        jsonInit("POST", body),
      ),
  },

  reports: {
    monthly: (userId: string) =>
      apiData<MonthlyReportPayload>(withQuery("/api/v1/reports/monthly", { userId })),
  },

  settings: {
    getLimit: (userId: string) =>
      apiData<JsonRecord>(withQuery("/api/v1/settings/limits", { userId })),
    updateLimit: (body: { userId: string; limit: number }) =>
      apiData<JsonRecord>("/api/v1/settings/limits", jsonInit("POST", body)),
  },

  security: {
    issueLevel2Proof: () =>
      apiData<{ riskProof: string }>("/api/v1/security/level2/proof", jsonInit("POST", {})),
    loginRiskEvaluate: (body: JsonRecord) =>
      apiData<JsonRecord>("/api/v1/security/login-risk/evaluate", jsonInit("POST", body)),
    webauthnRegisterBegin: (body: JsonRecord) =>
      apiData<{ challengeId: string }>("/api/v1/security/webauthn/register/begin", jsonInit("POST", body)),
    webauthnRegisterFinish: (body: JsonRecord) =>
      apiData<JsonRecord>("/api/v1/security/webauthn/register/finish", jsonInit("POST", body)),
    webauthnAuthenticateBegin: (body: JsonRecord) =>
      apiData<{ challengeId: string }>("/api/v1/security/webauthn/authenticate/begin", jsonInit("POST", body)),
    webauthnAuthenticateFinish: (body: JsonRecord) =>
      apiData<JsonRecord>("/api/v1/security/webauthn/authenticate/finish", jsonInit("POST", body)),
  },

  transfers: {
    create: (body: JsonRecord) =>
      apiData<JsonRecord>("/api/v1/transfers", jsonInit("POST", body)),
    detail: (transferId: string) =>
      apiData<JsonRecord>(`/api/v1/transfers/${encodeURIComponent(transferId)}`),
    list: (userId: string) =>
      apiData<JsonRecord[]>(withQuery("/api/v1/transfers", { userId })),
  },

  family: {
    alerts: (userId: string) =>
      apiData<JsonRecord[]>(withQuery("/api/v1/family-alerts", { userId })),
    registerConsent: (body: JsonRecord) =>
      apiData<JsonRecord>("/api/v1/family/consents", jsonInit("POST", body)),
    updateConsent: (body: JsonRecord) =>
      apiData<JsonRecord>("/api/v1/family/consents", jsonInit("PATCH", body)),
    revokeConsent: (parentUserId: string, childUserId: string) =>
      apiData<JsonRecord>(withQuery("/api/v1/family/consents", { parentUserId, childUserId }), {
        method: "DELETE",
      }),
    consents: (parentUserId: string) =>
      apiData<JsonRecord[]>(withQuery("/api/v1/family/consents", { parentUserId })),
    dashboard: (userId: string) =>
      apiData<JsonRecord>(withQuery("/api/v1/family/dashboard", { userId })),
  },

  myData: {
    authorize: (userId: string) =>
      apiData<AuthorizeUrlPayload>(withQuery("/api/v1/mydata/oauth/authorize", { userId })),
    callback: (body: { userId: string; code: string }) =>
      apiData<JsonRecord>("/api/v1/mydata/oauth/callback", jsonInit("POST", body)),
    unlink: (userId: string, institutionCode: string) =>
      apiData<JsonRecord>(
        withQuery(`/api/v1/mydata/links/${encodeURIComponent(institutionCode)}`, { userId }),
        { method: "DELETE" },
      ),
    institutions: (userId: string) =>
      apiData<JsonRecord[]>(withQuery("/api/v1/mydata/institutions", { userId })),
    institutionAuthorize: (userId: string, institutionCode: string) =>
      apiData<JsonRecord>(
        withQuery(`/api/v1/mydata/institutions/${encodeURIComponent(institutionCode)}/authorize`, { userId }),
      ),
    institutionCallback: (userId: string, institutionCode: string, code: string) =>
      apiData<JsonRecord>(
        withQuery(`/api/v1/mydata/institutions/${encodeURIComponent(institutionCode)}/callback`, { userId }),
        jsonInit("POST", { code }),
      ),
    institutionUnlink: (userId: string, institutionCode: string) =>
      apiData<JsonRecord>(
        withQuery(`/api/v1/mydata/institutions/${encodeURIComponent(institutionCode)}`, { userId }),
        { method: "DELETE" },
      ),
  },

  assets: {
    summary: (userId: string) =>
      apiData<JsonRecord>(withQuery("/api/v1/assets/summary", { userId })),
    trend: (userId: string) =>
      apiData<JsonRecord[]>(withQuery("/api/v1/assets/trend", { userId })),
  },

  cashflow: {
    criteria: (userId: string) =>
      apiData<JsonRecord>(withQuery("/api/v1/cashflow/criteria", { userId })),
    updateCriteria: (body: JsonRecord) =>
      apiData<JsonRecord>("/api/v1/cashflow/criteria", jsonInit("POST", body)),
    forecast: (userId: string) =>
      apiData<CashflowForecastPayload>(withQuery("/api/v1/cashflow/forecast", { userId })),
    risk: (userId: string) =>
      apiData<RiskAssessmentPayload>(withQuery("/api/v1/cashflow/risk", { userId })),
    action: (userId: string) =>
      apiData<ActionRecommendationPayload>(withQuery("/api/v1/cashflow/action", { userId })),
    recurringExpenses: (userId: string, fintechUseNum: string) =>
      apiData<JsonRecord[]>(
        withQuery("/api/v1/cashflow/recurring-expenses", { userId, fintechUseNum }),
      ),
    executeAction: (body: JsonRecord) =>
      apiData<JsonRecord>("/api/v1/cashflow/action/execute", jsonInit("POST", body)),
    feedback: (body: JsonRecord) =>
      apiData<JsonRecord>("/api/v1/cashflow/action/feedback", jsonInit("POST", body)),
    feedbackSummary: (userId: string) =>
      apiData<JsonRecord>(withQuery("/api/v1/cashflow/action/feedback-summary", { userId })),
    managementCalendar: (userId: string) =>
      apiData<JsonRecord[]>(withQuery("/api/v1/cashflow-management/calendar", { userId })),
    schedules: (userId: string) =>
      apiData<CashflowSchedulePayload[]>(withQuery("/api/v1/cashflow-management/schedules", { userId })),
    upsertSchedule: (body: JsonRecord) =>
      apiData<CashflowSchedulePayload>("/api/v1/cashflow-management/schedules", jsonInit("POST", body)),
    deleteSchedule: (userId: string, scheduleId: string) =>
      apiData<SimpleResultPayload>(
        withQuery(`/api/v1/cashflow-management/schedules/${encodeURIComponent(scheduleId)}`, { userId }),
        { method: "DELETE" },
      ),
    riskCauses: (userId: string) =>
      apiData<JsonRecord[]>(withQuery("/api/v1/cashflow-management/risk-causes", { userId })),
  },

  policy: {
    matches: (userId: string) =>
      apiData<PolicyMatchPayload[]>(withQuery("/api/v1/policy/match", { userId })),
    apply: (userId: string, policyCode: string) =>
      apiData<JsonRecord>(
        withQuery(`/api/v1/policy/${encodeURIComponent(policyCode)}/apply`, { userId }),
        jsonInit("POST", {}),
      ),
  },

  transactions: {
    sync: (userId: string, fintechUseNum: string) =>
      apiData<JsonRecord>(withQuery("/api/v1/transactions/sync", { userId, fintechUseNum }), {
        method: "POST",
      }),
    list: (userId: string, from?: string, to?: string) =>
      apiData<TransactionPayload[]>(withQuery("/api/v1/transactions", { userId, from, to })),
    recategorize: (userId: string) =>
      apiData<JsonRecord>(withQuery("/api/v1/transactions/recategorize", { userId }), {
        method: "POST",
      }),
  },

  registeredAccounts: {
    register: (body: { userId: string; accountNo: string; alias?: string }) =>
      apiData<JsonRecord>("/api/v1/registered-accounts", jsonInit("POST", body)),
    list: (userId: string) =>
      apiData<JsonRecord[]>(withQuery("/api/v1/registered-accounts", { userId })),
    unregister: (userId: string, accountNo: string) =>
      apiData<JsonRecord>(
        withQuery("/api/v1/registered-accounts", { userId, accountNo }),
        { method: "DELETE" },
      ),
  },

  persona: {
    get: (userId: string) =>
      apiData<PersonaPayload>(`/api/v1/persona/${encodeURIComponent(userId)}`),
    override: (userId: string, body: JsonRecord) =>
      apiData<PersonaPayload>(`/api/v1/persona/${encodeURIComponent(userId)}`, jsonInit("PUT", body)),
    reinfer: (userId: string) =>
      apiData<PersonaPayload>(`/api/v1/persona/${encodeURIComponent(userId)}/reinfer`, jsonInit("POST", {})),
  },

  notifications: {
    list: (userId: string) =>
      apiData<NotificationPayload[]>(withQuery("/api/v1/notifications", { userId })),
    generateReminders: (userId: string) =>
      apiData<JsonRecord>(withQuery("/api/v1/notifications/generate-reminders", { userId }), {
        method: "POST",
      }),
  },

  devices: {
    list: (userId: string) =>
      apiData<DevicePayload[]>(withQuery("/api/v1/devices", { userId })),
    rename: (deviceId: string, body: JsonRecord) =>
      apiData<DevicePayload>(`/api/v1/devices/${encodeURIComponent(deviceId)}/name`, jsonInit("PATCH", body)),
    revoke: (userId: string, deviceId: string) =>
      apiData<SimpleResultPayload>(
        withQuery(`/api/v1/devices/${encodeURIComponent(deviceId)}`, { userId }),
        { method: "DELETE" },
      ),
  },

  sessions: {
    create: (userId: string, deviceId?: string) =>
      apiData<TokenPairPayload>(withQuery("/api/v1/sessions", { userId, deviceId }), {
        method: "POST",
      }),
    refresh: (refreshToken: string) =>
      apiData<TokenPairPayload>("/api/v1/sessions/refresh", jsonInit("POST", { refreshToken })),
    list: (userId: string) =>
      apiData<SessionPayload[]>(withQuery("/api/v1/sessions", { userId })),
    revoke: (sessionId: string) =>
      apiData<SimpleResultPayload>(`/api/v1/sessions/${encodeURIComponent(sessionId)}`, {
        method: "DELETE",
      }),
    revokeAll: (userId: string) =>
      apiData<SimpleResultPayload>(withQuery("/api/v1/sessions", { userId }), {
        method: "DELETE",
      }),
  },

  consents: {
    list: (userId: string) =>
      apiData<ConsentPayload[]>(withQuery("/api/v1/consents", { userId })),
    revoke: (consentId: string, reason?: string) =>
      apiData<SimpleResultPayload>(
        withQuery(`/api/v1/consents/${encodeURIComponent(consentId)}/revoke`, { reason }),
        { method: "POST" },
      ),
    unlinkMyData: (userId: string, institutionCode: string) =>
      apiData<SimpleResultPayload>(
        withQuery(`/api/v1/consents/mydata/${encodeURIComponent(institutionCode)}`, { userId }),
        { method: "DELETE" },
      ),
    unlinkSocial: (userId: string, provider: SocialProvider) =>
      apiData<SimpleResultPayload>(
        withQuery(`/api/v1/consents/social/${provider}`, { userId }),
        { method: "DELETE" },
      ),
    revokeBiometric: (userId: string) =>
      apiData<SimpleResultPayload>(withQuery("/api/v1/consents/biometric", { userId }), {
        method: "DELETE",
      }),
  },

  externalFinance: {
    bankTransfer: (
      bank: "kakao-bank" | "hana-bank" | "kb-bank" | "shinhan-bank" | "im-bank",
      body: JsonRecord,
    ) => apiData<JsonRecord>(`/api/v1/external/${bank}/transfer`, jsonInit("POST", body)),
    openBankingAccounts: (userId: string) =>
      apiData<JsonRecord>(withQuery("/api/v1/external/openbanking/accounts", { userId })),
    openBankingBalance: (userId: string, fintechUseNum: string) =>
      apiData<JsonRecord>(
        withQuery("/api/v1/external/openbanking/balance", { userId, fintechUseNum }),
      ),
    openBankingTransactions: (userId: string, fintechUseNum: string) =>
      apiData<JsonRecord>(
        withQuery("/api/v1/external/openbanking/transactions", { userId, fintechUseNum }),
      ),
    openBankingTransfer: (body: JsonRecord) =>
      apiData<JsonRecord>("/api/v1/external/openbanking/transfer", jsonInit("POST", body)),
    pensionSummary: (userId: string) =>
      apiData<JsonRecord>(withQuery("/api/v1/external/pension/summary", { userId })),
  },

  codes: {
    list: (params?: QueryParams) => apiData<JsonRecord[]>(withQuery("/api/v1/codes", params)),
    displayName: (group: string, value: string, locale?: string) =>
      apiData<JsonRecord>(
        withQuery(`/api/v1/codes/${encodeURIComponent(group)}/${encodeURIComponent(value)}`, { locale }),
      ),
    children: (parentCodeId: string) =>
      apiData<JsonRecord[]>(`/api/v1/codes/children/${encodeURIComponent(parentCodeId)}`),
    upsert: (body: JsonRecord) => apiData<JsonRecord>("/api/v1/codes", jsonInit("POST", body)),
    remove: (codeId: string) =>
      apiData<SimpleResultPayload>(`/api/v1/codes/${encodeURIComponent(codeId)}`, {
        method: "DELETE",
      }),
    reload: () => apiData<SimpleResultPayload>("/api/v1/codes/reload", jsonInit("POST", {})),
  },

  kpi: {
    user: (userId: string) => apiData<JsonRecord>(`/api/v1/kpi/user/${encodeURIComponent(userId)}`),
    global: () => apiData<JsonRecord>("/api/v1/kpi/global"),
  },

  voice: {
    stt: (body: JsonRecord) => apiData<JsonRecord>("/api/v1/voice/stt", jsonInit("POST", body)),
    tts: (body: JsonRecord) => apiData<JsonRecord>("/api/v1/voice/tts", jsonInit("POST", body)),
  },

  feedback: {
    submit: (body: JsonRecord) => apiData<JsonRecord>("/api/v1/feedback", jsonInit("POST", body)),
  },

  actions: {
    tracking: (actionType: string, userId: string) =>
      apiData<JsonRecord>(
        withQuery(`/api/v1/actions/tracking/${encodeURIComponent(actionType)}`, { userId }),
      ),
  },

  admin: {
    policies: () => apiData<JsonRecord[]>("/api/v1/admin/policies"),
    upsertPolicy: (body: JsonRecord) =>
      apiData<JsonRecord>("/api/v1/admin/policies", jsonInit("POST", body)),
    deactivatePolicy: (policyCode: string) =>
      apiData<SimpleResultPayload>(`/api/v1/admin/policies/${encodeURIComponent(policyCode)}`, {
        method: "DELETE",
      }),
    aiTemplates: () => apiData<JsonRecord[]>("/api/v1/admin/ai-templates"),
    upsertAiTemplate: (body: JsonRecord) =>
      apiData<JsonRecord>("/api/v1/admin/ai-templates", jsonInit("POST", body)),
    deactivateAiTemplate: (templateKey: string) =>
      apiData<SimpleResultPayload>(`/api/v1/admin/ai-templates/${encodeURIComponent(templateKey)}`, {
        method: "DELETE",
      }),
  },

  auditLogs: {
    list: (size = 50) => apiData<JsonRecord[]>(withQuery("/api/v1/audit-logs", { size })),
  },
};
