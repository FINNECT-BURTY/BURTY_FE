type ScheduleCardProps = Readonly<{
  title: string;
  dateLabel: string;
  amount: number;
  risky?: boolean;
}>;

const currencyFormatter = new Intl.NumberFormat("ko-KR");

export function formatWon(amount: number) {
  const sign = amount > 0 ? "+" : "";
  return `${sign}${currencyFormatter.format(amount)}원`;
}

export function ScheduleCard({
  title,
  dateLabel,
  amount,
  risky = false,
}: ScheduleCardProps) {
  return (
    <section className="rounded-2xl border border-grayscale-100 bg-background px-5 py-5">
      {risky ? (
        <p className="text-caption mb-3 text-[#ff3b30]">위험 발생 예정</p>
      ) : null}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-body-md text-grayscale-1000">{title}</p>
          <p className="text-caption mt-1 text-grayscale-800">{dateLabel}</p>
        </div>
        <p className="text-body-md shrink-0 text-grayscale-1000">
          {formatWon(amount)}
        </p>
      </div>
    </section>
  );
}
