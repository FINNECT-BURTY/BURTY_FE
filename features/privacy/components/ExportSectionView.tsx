import type { ExportSection } from "@/features/privacy/api/privacy";

/**
 * 열람 결과 한 구획.
 *
 * <p>백엔드가 `Map<String, Object>` 로 주므로 모양이 고정돼 있지 않다. 값의 종류에 따라
 * 표·목록·단일값으로 갈라 그린다. 원문 JSON 을 그대로 뿌리지 않는다 — 읽으라고 주는
 * 화면인데 읽을 수 없으면 열람이 아니다.
 */
export function ExportSectionView({
  section,
}: Readonly<{ section: ExportSection }>) {
  return (
    <section className="rounded-2xl border border-grayscale-100 bg-background px-5 py-4">
      <h3 className="text-title-sm text-grayscale-1000">{section.label}</h3>
      <div className="mt-2">
        <ValueView value={section.value} />
      </div>
    </section>
  );
}

function ValueView({ value }: Readonly<{ value: unknown }>) {
  if (Array.isArray(value)) {
    return (
      <ul className="space-y-2">
        {value.map((entry, index) => (
          <li
            className="rounded-xl bg-main-background px-3 py-2"
            key={index}
          >
            <ValueView value={entry} />
          </li>
        ))}
      </ul>
    );
  }

  if (isRecord(value)) {
    return (
      <dl className="space-y-1">
        {Object.entries(value).map(([key, entry]) => (
          <div className="flex items-start justify-between gap-3" key={key}>
            <dt className="text-caption shrink-0 text-grayscale-600">
              {fieldLabels[key] ?? key}
            </dt>
            <dd className="text-body-md min-w-0 break-all text-right text-grayscale-1000">
              {formatScalar(entry)}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <p className="text-body-md break-all text-grayscale-1000">
      {formatScalar(value)}
    </p>
  );
}

const fieldLabels: Readonly<Record<string, string>> = {
  agreedAt: "동의일",
  birthdate: "생년월일",
  consentExpiresAt: "동의 만료",
  createdAt: "가입일",
  institutionName: "기관",
  lastLoginAt: "마지막 로그인",
  lastSeenAt: "마지막 사용",
  lastSyncedAt: "마지막 동기화",
  name: "이름",
  phone: "전화번호",
  platform: "기기",
  provider: "제공자",
  requestedAt: "요청일",
  retentionUntil: "보존 만료",
  revokedAt: "철회일",
  status: "상태",
  transactions: "거래",
  transferOrders: "이체",
};

/**
 * 값 하나를 화면 문자열로.
 *
 * <p>서버가 `String.valueOf` 로 감싸 보내는 항목이 있어 값 없음이 문자열 `"null"` 로
 * 도착한다. 그대로 두면 사용자가 자기 정보에 "null" 이 저장돼 있다고 읽는다.
 */
function formatScalar(value: unknown): string {
  if (value === null || value === undefined) return "없음";
  if (typeof value === "boolean") return value ? "예" : "아니오";
  if (typeof value === "number") return value.toLocaleString("ko-KR");

  const text = String(value);
  if (text === "null" || text === "" ) return "없음";
  return text;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
