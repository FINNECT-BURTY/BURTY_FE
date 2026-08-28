type SkeletonProps = Readonly<{
  className?: string;
}>;

/**
 * 자리표시 블록.
 *
 * <p>스피너 대신 최종 레이아웃과 같은 크기의 블록을 먼저 그린다. 데이터가 도착할 때
 * 화면이 밀리지 않고, 무엇이 오는 중인지도 함께 알려준다.
 *
 * <p>금액 자리에는 실제 자릿수와 비슷한 폭을 준다. 폭이 크게 다르면 값이 들어오는 순간
 * 카드 높이가 바뀐다.
 */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`animate-skeleton block rounded-md bg-grayscale-100 ${className}`}
    />
  );
}

/** 여러 줄짜리 자리표시. 마지막 줄은 짧게 해서 문단처럼 보이게 한다. */
export function SkeletonLines({
  className = "",
  lines = 2,
}: Readonly<{ className?: string; lines?: number }>) {
  return (
    <span aria-hidden="true" className={`block space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          className={`h-4 ${index === lines - 1 ? "w-2/5" : "w-4/5"}`}
          key={index}
        />
      ))}
    </span>
  );
}
