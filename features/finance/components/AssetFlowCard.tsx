import Image from "next/image";
import {
  Area,
  AreaChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type AssetFlowPoint = Readonly<{
  date: string;
  balance: number;
}>;

type AxisTickProps = Readonly<{
  payload?: Readonly<{
    value?: string;
  }>;
  x?: number;
  y?: number;
}>;

const assetFlowData: readonly AssetFlowPoint[] = [
  { date: "1일", balance: 30 },
  { date: "5일", balance: 24 },
  { date: "10일", balance: 35 },
  { date: "15일", balance: 43 },
  { date: "20일", balance: 31 },
  { date: "25일", balance: 13 },
  { date: "30일", balance: 50 },
];

const riskPoint = assetFlowData.find((point) => point.date === "25일");
const riskLineSegment = riskPoint
  ? ([
      { x: riskPoint.date, y: riskPoint.balance + 25 },
      { x: riskPoint.date, y: riskPoint.balance + 2 },
    ] as const)
  : null;

function AxisTick({ payload, x = 0, y = 0 }: AxisTickProps) {
  const value = payload?.value ?? "";
  const isRiskDate = value === riskPoint?.date;

  return (
    <text
      fill={isRiskDate ? "var(--grayscale-1000)" : "var(--grayscale-700)"}
      fontSize="11"
      fontWeight={isRiskDate ? 600 : 400}
      textAnchor="middle"
      x={x}
      y={y + 14}
    >
      {value}
    </text>
  );
}

export function AssetFlowCard() {
  return (
    <section className="bg-background px-4 pb-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-title-md text-grayscale-1000">
            00님 예상 위험이 있어요
          </h2>
          <p className="text-body-md mt-1 text-grayscale-900">
            25일에 -12,000원이 부족할 예정이에요
          </p>
        </div>
        <button
          aria-label="자산 흐름 상세 보기"
          className="flex size-8 shrink-0 items-start justify-end pt-0.5"
          type="button"
        >
          <Image
            alt=""
            aria-hidden="true"
            height={17}
            src="/icons/finance/right-arrow-gray-800.svg"
            width={12}
          />
        </button>
      </div>

      <div
        aria-label="1일부터 30일까지의 5일 간격 예상 자산 흐름"
        className="mt-2 h-[148px] w-full overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="img"
      >
        <div className="h-full min-w-[640px]">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart
              data={assetFlowData}
              margin={{ bottom: 18, left: 0, right: 0, top: 28 }}
            >
              <defs>
                <linearGradient
                  id="asset-flow-gradient"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--yellow-400)"
                    stopOpacity={0.78}
                  />
                  <stop
                    offset="58%"
                    stopColor="var(--yellow-300)"
                    stopOpacity={0.56}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--yellow-200)"
                    stopOpacity={0.36}
                  />
                </linearGradient>
              </defs>

              <XAxis
                axisLine={false}
                dataKey="date"
                interval={0}
                padding={{ left: 24, right: 24 }}
                tick={<AxisTick />}
                tickLine={false}
              />
              <YAxis domain={[0, 56]} hide />

              <Area
                dataKey="balance"
                dot={false}
                activeDot={false}
                fill="url(#asset-flow-gradient)"
                isAnimationActive={false}
                stroke="var(--yellow-400)"
                strokeWidth={2}
                type="natural"
              />
              {/* TODO: 하드코딩 해둔 값들 변경 필요 */}
              {riskPoint ? (
                <>
                  <ReferenceLine
                    ifOverflow="visible"
                    segment={riskLineSegment ?? undefined}
                    stroke="var(--yellow-500)"
                    strokeDasharray="4 1"
                    strokeLinecap="round"
                  />
                  <ReferenceDot
                    ifOverflow="visible"
                    fill="var(--yellow-400)"
                    r={4}
                    stroke="var(--background)"
                    strokeWidth={2}
                    x={riskPoint.date}
                    y={riskPoint.balance}
                  />
                </>
              ) : null}

              <text
                fill="var(--grayscale-900)"
                fontSize="11"
                textAnchor="middle"
                x="81%"
                y="40"
              >
                위험 예상 발생
              </text>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
