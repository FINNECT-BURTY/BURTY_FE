"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export type AssetFlowPoint = Readonly<{
  balance: number;
  date: string;
  day: number;
}>;

type AssetFlowChartProps = Readonly<{
  className?: string;
  interactive?: boolean;
}>;

type AxisTickProps = Readonly<{
  payload?: Readonly<{
    value?: string;
  }>;
  x?: number;
  y?: number;
}>;

type ChartRange = Readonly<{
  endDay: number;
  label: string;
  startDay: number;
}>;

const chartRanges: readonly ChartRange[] = [
  { endDay: 10, label: "1~10일", startDay: 1 },
  { endDay: 20, label: "10~20일", startDay: 10 },
  { endDay: 30, label: "20~30일", startDay: 20 },
];

const assetFlowData: readonly AssetFlowPoint[] = [
  { balance: 30, date: "1일", day: 1 },
  { balance: 28, date: "2일", day: 2 },
  { balance: 27, date: "3일", day: 3 },
  { balance: 25, date: "4일", day: 4 },
  { balance: 24, date: "5일", day: 5 },
  { balance: 26, date: "6일", day: 6 },
  { balance: 28, date: "7일", day: 7 },
  { balance: 31, date: "8일", day: 8 },
  { balance: 33, date: "9일", day: 9 },
  { balance: 35, date: "10일", day: 10 },
  { balance: 37, date: "11일", day: 11 },
  { balance: 39, date: "12일", day: 12 },
  { balance: 40, date: "13일", day: 13 },
  { balance: 42, date: "14일", day: 14 },
  { balance: 43, date: "15일", day: 15 },
  { balance: 40, date: "16일", day: 16 },
  { balance: 37, date: "17일", day: 17 },
  { balance: 35, date: "18일", day: 18 },
  { balance: 33, date: "19일", day: 19 },
  { balance: 31, date: "20일", day: 20 },
  { balance: 28, date: "21일", day: 21 },
  { balance: 24, date: "22일", day: 22 },
  { balance: 20, date: "23일", day: 23 },
  { balance: 16, date: "24일", day: 24 },
  { balance: 13, date: "25일", day: 25 },
  { balance: 20, date: "26일", day: 26 },
  { balance: 27, date: "27일", day: 27 },
  { balance: 35, date: "28일", day: 28 },
  { balance: 43, date: "29일", day: 29 },
  { balance: 50, date: "30일", day: 30 },
];

const riskPoint = assetFlowData.find((point) => point.date === "25일");
const overviewTickDays = [1, 10, 20, 30] as const;

function AxisTick({
  payload,
  x = 0,
  y = 0,
  compact = false,
  visibleRiskDate,
}: AxisTickProps & Readonly<{ compact?: boolean; visibleRiskDate?: string }>) {
  const value = payload?.value ?? "";
  const isRiskDate = value === visibleRiskDate;
  const label = compact ? value.replace("일", "") : value;

  return (
    <text
      fill={isRiskDate ? "var(--grayscale-1000)" : "var(--grayscale-700)"}
      fontSize="11"
      fontWeight={isRiskDate ? 600 : 400}
      textAnchor="middle"
      x={x}
      y={y + 14}
    >
      {label}
    </text>
  );
}

export function AssetFlowChart({
  className = "",
  interactive = false,
}: AssetFlowChartProps) {
  const [selectedRange, setSelectedRange] = useState<ChartRange | null>(null);
  const [hoveredRange, setHoveredRange] = useState<ChartRange | null>(null);
  const isExpanded = selectedRange !== null;
  const visibleData = useMemo(() => {
    if (!selectedRange) return assetFlowData;

    return assetFlowData.filter(
      (point) =>
        point.day >= selectedRange.startDay && point.day <= selectedRange.endDay,
    );
  }, [selectedRange]);
  const highlightedRange = selectedRange ? null : hoveredRange;
  const chartData = useMemo(
    () =>
      visibleData.map((point) => ({
        ...point,
        highlightedBalance:
          highlightedRange &&
          point.day >= highlightedRange.startDay &&
          point.day <= highlightedRange.endDay
            ? point.balance
            : null,
      })),
    [highlightedRange, visibleData],
  );
  const visibleRiskPoint = visibleData.find(
    (point) => point.date === riskPoint?.date,
  );
  const riskLineSegment = visibleRiskPoint
    ? ([
        { x: visibleRiskPoint.date, y: visibleRiskPoint.balance + 25 },
        { x: visibleRiskPoint.date, y: visibleRiskPoint.balance + 2 },
      ] as const)
    : null;
  const xAxisTicks = selectedRange
    ? visibleData.map((point) => point.date)
    : overviewTickDays.map((day) => `${day}일`);

  return (
    <div
      aria-label={
        selectedRange
          ? `${selectedRange.label} 일별 예상 자산 흐름`
          : "1일부터 30일까지의 예상 자산 흐름"
      }
      className={`${className} w-full overflow-hidden`}
    >
      {interactive && selectedRange ? (
        <div className="mb-2 flex justify-end">
          <button
            className="text-caption rounded-full border border-grayscale-200 bg-background px-3 py-1 text-grayscale-800"
            onClick={() => setSelectedRange(null)}
            type="button"
          >
            전체
          </button>
        </div>
      ) : null}
      <div
        className={`relative ${
          interactive ? (isExpanded ? "h-[220px]" : "h-[148px]") : "h-full"
        }`}
      >
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart
            data={chartData}
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
              tick={
                <AxisTick
                  compact={selectedRange !== null}
                  visibleRiskDate={visibleRiskPoint?.date}
                />
              }
              tickLine={false}
              ticks={xAxisTicks}
            />
            <YAxis domain={[0, 56]} hide />

            <Area
              activeDot={false}
              dataKey="balance"
              dot={false}
              fill="url(#asset-flow-gradient)"
              isAnimationActive={false}
              stroke="var(--yellow-400)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              type="monotone"
            />
            {highlightedRange ? (
              <Area
                activeDot={false}
                connectNulls={false}
                dataKey="highlightedBalance"
                dot={false}
                fill="var(--yellow-300)"
                fillOpacity={0.52}
                isAnimationActive={false}
                stroke="var(--yellow-500)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                type="monotone"
              />
            ) : null}
            {visibleRiskPoint ? (
              <>
                <ReferenceLine
                  ifOverflow="visible"
                  segment={riskLineSegment ?? undefined}
                  stroke="var(--red)"
                  strokeDasharray="4 1"
                  strokeLinecap="round"
                />
                <ReferenceDot
                  fill="var(--red)"
                  ifOverflow="visible"
                  r={4}
                  stroke="var(--background)"
                  strokeWidth={2}
                  x={visibleRiskPoint.date}
                  y={visibleRiskPoint.balance}
                />
              </>
            ) : null}

            {visibleRiskPoint ? (
              <text
                fill="var(--red)"
                fontSize="11"
                textAnchor="middle"
                x={selectedRange ? "50%" : "78%"}
                y={selectedRange ? "62" : "40"}
              >
                위험 예상 발생
              </text>
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
        {interactive && !selectedRange ? (
          <div className="absolute inset-x-0 bottom-[18px] top-7 flex">
            {chartRanges.map((range) => (
              <button
                aria-label={`${range.label} 상세 차트 보기`}
                className="h-full flex-1 cursor-pointer bg-transparent focus-visible:outline-none"
                key={range.label}
                onBlur={() => setHoveredRange(null)}
                onClick={() => setSelectedRange(range)}
                onFocus={() => setHoveredRange(range)}
                onMouseEnter={() => setHoveredRange(range)}
                onMouseLeave={() => setHoveredRange(null)}
                type="button"
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
