import { requestLevel2Proof } from "@/features/security/api/riskProof";
import { fetchApiData, fetchApiList } from "@/shared/api/apiResponse";

/** `GET /api/v1/settings/limits` — 백엔드 `LimitResponse`. */
export type TransferLimit = Readonly<{
  userId?: string;
  limit: number;
}>;

/** `GET /api/v1/registered-accounts` — 백엔드 `RegisteredAccountUseCase.View`. */
export type RegisteredAccount = Readonly<{
  accountNo: string;
  alias?: string | null;
}>;

/**
 * `POST /api/v1/transfers` 와 목록의 응답 — 백엔드 `TransferResponse`.
 *
 * <p>`status` 는 `TransferOrderEntity.Status` 이름이거나, 실행 완료면 `COMPLETED` 다.
 */
export type Transfer = Readonly<{
  transferId: string;
  status: string;
  familyNotified: boolean;
}>;

/**
 * 이체 결과 상태.
 *
 * <p><b>`UNKNOWN` 을 실패로 뭉뚱그리면 안 된다.</b> 은행 응답을 받지 못했을 뿐 출금은 됐을 수
 * 있다. 사용자에게 "실패했다" 고 말하면 같은 이체를 다시 보내게 되고, 그러면 두 번 나간다.
 * 정산 배치가 은행에 조회해 확정할 때까지 "확인 중" 으로 둔다.
 */
export type TransferOutcome = "completed" | "pending" | "rejected" | "unknown";

export function classifyTransfer(status: string | null | undefined): TransferOutcome {
  switch ((status ?? "").toUpperCase()) {
    case "COMPLETED":
    case "EXECUTED":
      return "completed";
    // 아직 결과가 정해지지 않았다. 사용자가 다시 시도하면 안 되는 구간이다.
    case "UNKNOWN":
    case "EXECUTING":
      return "unknown";
    case "FAILED":
    case "CANCELLED":
    case "REVERSED":
      return "rejected";
    default:
      // PENDING, AWAITING_APPROVAL, AUTH_REQUESTED, AUTHORIZED
      return "pending";
  }
}

const outcomeLabels: Record<TransferOutcome, string> = {
  completed: "이체 완료",
  pending: "처리 중",
  rejected: "이체 실패",
  unknown: "결과 확인 중",
};

export function transferOutcomeLabel(outcome: TransferOutcome): string {
  return outcomeLabels[outcome];
}

/** 상태별 사용자에게 필요한 설명. 상태 코드만으로는 무엇을 해야 할지 알 수 없다. */
const outcomeDescriptions: Record<TransferOutcome, string> = {
  completed: "정상적으로 보냈어요",
  pending: "승인 또는 처리가 끝나면 알려드릴게요",
  rejected: "돈은 빠져나가지 않았어요",
  unknown:
    "은행 응답을 받지 못했어요. 출금됐을 수 있으니 다시 보내지 마세요. 확인되면 알려드릴게요",
};

export function transferOutcomeDescription(outcome: TransferOutcome): string {
  return outcomeDescriptions[outcome];
}

/** 보호자 승인을 기다리는 상태인가. */
export function isAwaitingApproval(status: string | null | undefined): boolean {
  return (status ?? "").toUpperCase() === "AWAITING_APPROVAL";
}

// ── 조회 ──────────────────────────────────────────────────────────────────

export type TransferOverview = Readonly<{
  accounts: readonly RegisteredAccount[];
  limit: TransferLimit | null;
  transfers: readonly Transfer[];
}>;

export async function fetchTransferOverview(): Promise<TransferOverview> {
  const [limit, transfers, accounts] = await Promise.all([
    fetchApiData<TransferLimit>("/api/v1/settings/limits").catch(() => null),
    fetchApiList<Transfer>("/api/v1/transfers").catch(
      () => [] as readonly Transfer[],
    ),
    fetchRegisteredAccounts().catch(() => [] as readonly RegisteredAccount[]),
  ]);

  return { accounts, limit, transfers };
}

/**
 * 등록 계좌 목록. 백엔드가 LEVEL_2 단계 인증을 요구한다.
 *
 * <p>예전에는 증명 없이 불러 403 을 받았고, 실패를 빈 목록으로 삼켜 이체 화면의 등록 계좌가
 * 항상 비어 보였다.
 */
async function fetchRegisteredAccounts(): Promise<readonly RegisteredAccount[]> {
  const riskProof = await requestLevel2Proof();
  return fetchApiList<RegisteredAccount>("/api/v1/registered-accounts", {
    headers: { "X-Risk-Proof": riskProof },
  });
}

// ── 실행 ──────────────────────────────────────────────────────────────────

export type TransferCommand = Readonly<{
  amount: number;
  assertionToken: string;
  description?: string;
  fromAccount: string;
  /** 재시도해도 두 번 나가지 않도록 호출부가 만들어 고정한다. */
  idempotencyKey: string;
  riskProof: string;
  toAccount: string;
}>;

/**
 * 이체를 실행한다.
 *
 * <p>같은 이체를 두 번 보내지 않는 책임이 호출부에 있다. 멱등키는 <b>화면에서 한 번 만들고
 * 재시도에도 그대로 쓴다.</b> 요청마다 새로 만들면 멱등성이 무의미해진다.
 */
export function executeTransfer(command: TransferCommand): Promise<Transfer | null> {
  const { riskProof, ...body } = command;

  return fetchApiData<Transfer>("/api/v1/transfers", {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      // LEVEL_3 단계 인증 증명. 생체인증을 통과해야 발급된다.
      "X-Risk-Proof": riskProof,
    },
    method: "POST",
  });
}

/** 새 멱등키. 화면 진입 시 한 번만 만든다. */
export function newIdempotencyKey(): string {
  return `web-${crypto.randomUUID()}`;
}
