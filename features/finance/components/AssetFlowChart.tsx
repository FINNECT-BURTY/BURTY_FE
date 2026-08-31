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

import type { AssetFlowPoint } from "@/features/finance/api/assetFlow";
import { formatCompactWon } from "@/shared/ui/money";

type AssetFlowChartProps = Readonly<{
  className?: string;
  interactive?: boolean;
  points: readonly AssetFlowPoint[];
  /** 예측상 잔액이 안전선 아래로 내려가는 날. 없으면 위험 표식을 그리지 않는다. */
  riskDate?: string | null;
  /** 사용자가 정한 안전잔액. 이 선 아래로 내려가는 순간이 이 차트의 핵심이다. */
  safetyBalance?: number;
}>;

type AxisTickProps = Readonly<{
  payload?: Readonly<{ value?: string }>;
  x?: number;
  y?: number;
}>;

/**
 * 확대 구간.
 *
 * <p>날짜가 아니라 시계열 위치(1부터)로 나눈다. 예측은 오늘부터 30일이라 월 경계를 넘고,
 * 날짜의 "일" 로 나누면 8월 30일과 9월 30일이 같은 구간에 들어간다.
 */
type ChartRange = Readonly<{
  end: number;
  label: string;
  start: number;
}>;

const chartRanges: readonly ChartRange[] = [
  { end: 10, label: "1~10일차", start: 1 },
  { end: 20, label: "11~20일차", start: 11 },
  { end: 31, label: "21일차 이후", start: 21 },
];

/** 전체 보기에서 눈금을 찍을 위치. 촘촘하면 라벨이 겹친다. */
const overviewTickPositions = [1, 10, 20, 30] as const;

function AxisTick({
  payload,
  x = 0,
  y = 0,
  compact = false,
  visibleRiskLabel,
}: AxisTickProps & Readonly<{ compact?: boolean; visibleRiskLabel?: string }>) {
  const value = payload?.value ?? "";
  const isRiskDate = value === visibleRiskLabel;
  const label = compact ? value.replace("일", "") : value;

  return (
    <text
      fill={isRiskDate ? "var(--red)" : "var(--grayscale-700)"}
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

/**
 * 세로축 범위.
 *
 * <p>데이터 최소·최대에 여백을 준다. 값에 딱 맞추면 선이 위아래 테두리에 닿아
 * 변화 폭을 읽기 어렵다.
 *
 * <p>0 과 안전선은 범위 안에 반드시 포함한다. 잔액이 0 아래로 내려가는데 축이
 * 그 구간을 잘라내면, 이 차트가 알려야 할 바로 그 사실이 보이지 않는다.
 */
function computeDomain(
  values: readonly number[],
  safetyBalance: number | undefined,
): readonly [number, number] {
  if (values.length === 0) return [0, 1];

  const candidates = [...values, 0];
  if (safetyBalance !== undefined) candidates.push(safetyBalance);

  const min = Math.min(...candidates);
  const max = Math.max(...candidates);
  const padding = Math.max((max - min) * 0.15, 1);

  return [min - padding, max + padding];
}

/**
 * 세로축에서 0원이 놓이는 위치(0~1).
 *
 * <p>이 값으로 그라디언트를 갈라 0원 아래 구간을 붉게 칠한다. 잔액이 마이너스로
 * 내려가는 지점은 이 차트가 알려야 할 가장 중요한 사실인데, 한 가지 색으로 칠하면
 * 축 눈금 없이는 어디서부터가 마이너스인지 알 수 없다.
 */
function zeroOffsetRatio([min, max]: readonly [number, number]): number | null {
  if (min >= 0 || max <= 0) return null;
  return (max - 0) / (max - min);
}

export function AssetFlowChart({
  className = "",
  interactive = false,
  points,
  riskDate,
  safetyBalance,
}: AssetFlowChartProps) {
  const [selectedRange, setSelectedRange] = useState<ChartRange | null>(null);
  const [hoveredRange, setHoveredRange] = useState<ChartRange | null>(null);

  const isExpanded = selectedRange !== null;

  const visibleData = useMemo(() => {
    if (!selectedRange) return points;
    return points.filter(
      (point) =>
        point.index >= selectedRange.start && point.index <= selectedRange.end,
    );
  }, [points, selectedRange]);

  const highlightedRange = selectedRange ? null : hoveredRange;

  const chartData = useMemo(
    () =>
      visibleData.map((point) => ({
        ...point,
        highlightedBalance:
          highlightedRange &&
          point.index >= highlightedRange.start &&
          point.index <= highlightedRange.end
            ? point.balance
            : null,
      })),
    [highlightedRange, visibleData],
  );

  const riskPoint = riskDate
    ? points.find((point) => point.date === riskDate)
    : undefined;
  const visibleRiskPoint = riskPoint
    ? visibleData.find((point) => point.date === riskPoint.date)
    : undefined;

  const domain = useMemo(
    () => computeDomain(visibleData.map((point) => point.balance), safetyBalance),
    [safetyBalance, visibleData],
  );

  const zeroOffset = zeroOffsetRatio(domain);

  const xAxisTicks = selectedRange
    ? visibleData.map((point) => point.label)
    : overviewTickPositions
        .map((position) => points.find((point) => point.index === position)?.label)
        .filter((label): label is string => Boolean(label));

  if (points.length === 0) {
    return (
      <div
        className={`${className} flex h-[148px] items-center justify-center rounded-xl bg-grayscale-100/50`}
      >
        <p className="text-body-md text-grayscale-600">
          예측할 잔액 정보가 아직 없어요
        </p>
      </div>
    );
  }

  return (
    <div
      aria-label={
        selectedRange
          ? `${selectedRange.label} 일별 예상 잔액`
          : "이번 달 일별 예상 잔액 흐름"
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
                {zeroOffset === null ? (
                  <>
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
                  </>
                ) : (
                  <>
                    {/* 0원 지점에서 색을 끊는다. 아래는 마이너스 구간이다. */}
                    <stop
                      offset={`${zeroOffset * 100}%`}
                      stopColor="var(--yellow-200)"
                      stopOpacity={0.42}
                    />
                    <stop
                      offset={`${zeroOffset * 100}%`}
                      stopColor="var(--red)"
                      stopOpacity={0.22}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--red)"
                      stopOpacity={0.32}
                    />
                  </>
                )}
              </linearGradient>
            </defs>

            <XAxis
              axisLine={false}
              dataKey="label"
              interval={0}
              padding={{ left: 24, right: 24 }}
              tick={
                <AxisTick
                  compact={selectedRange !== null}
                  visibleRiskLabel={visibleRiskPoint?.label}
                />
              }
              tickLine={false}
              ticks={xAxisTicks}
            />
            <YAxis domain={domain} hide />

            {/* 0원 — 잔액이 바닥나는 선. 안전선보다 먼저 그려 뒤로 깔리게 한다. */}
            {zeroOffset !== null ? (
              <ReferenceLine
                ifOverflow="visible"
                label={{
                  fill: "var(--red)",
                  fontSize: 10,
                  // 안전선 라벨과 같은 쪽에 두면 두 선이 가까울 때 글자가 겹친다.
                  position: "insideBottomRight",
                  value: "0원",
                }}
                stroke="var(--red)"
                strokeOpacity={0.45}
                y={0}
              />
            ) : null}

            {/* 안전잔액 — 이 선 아래로 내려가면 위험이다. 값을 함께 적어야 선의 뜻이 산다. */}
            {safetyBalance !== undefined ? (
              <ReferenceLine
                ifOverflow="visible"
                label={{
                  fill: "var(--grayscale-600)",
                  fontSize: 10,
                  position: "insideTopLeft",
                  value: `안전 ${formatCompactWon(safetyBalance)}`,
                }}
                stroke="var(--grayscale-300)"
                strokeDasharray="3 3"
                y={safetyBalance}
              />
            ) : null}

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
              // 점만 찍는다. 카드 상단에 "N일에 얼마 부족" 이 이미 적혀 있어
              // 차트 안에 같은 말을 또 넣으면 선과 겹치기만 하고 알려주는 것이 없다.
              <ReferenceDot
                fill="var(--red)"
                ifOverflow="visible"
                r={4}
                stroke="var(--background)"
                strokeWidth={2}
                x={visibleRiskPoint.label}
                y={visibleRiskPoint.balance}
              />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>

        {interactive && !selectedRange ? (
          <div className="absolute inset-x-0 bottom-[18px] top-7 flex">
            {chartRanges.map((range) => (
              <button
                aria-label={`${range.label} 상세 차트 보기`}
                className="h-full flex-1 cursor-pointer bg-transparent"
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
