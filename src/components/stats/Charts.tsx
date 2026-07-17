"use client";

export function DailyBarChart({ data }: { data: { date: string; total: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  const width = 700;
  const height = 180;
  const barGap = 3;
  const barWidth = data.length > 0 ? width / data.length - barGap : 0;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full" preserveAspectRatio="none">
      {data.map((d, i) => {
        const barHeight = (d.total / max) * (height - 20);
        const x = i * (barWidth + barGap);
        const y = height - barHeight;
        const isToday = i === data.length - 1;
        return (
          <g key={d.date}>
            <rect
              x={x}
              y={y}
              width={Math.max(barWidth, 1)}
              height={barHeight}
              rx={2}
              fill={isToday ? "#0f766e" : "#a8e5db"}
            >
              <title>
                {d.date}: {d.total.toFixed(2)} ₴
              </title>
            </rect>
          </g>
        );
      })}
    </svg>
  );
}

export function TopProductsBars({
  data,
}: {
  data: { name: string; quantity: number; revenue: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  return (
    <div className="space-y-2.5">
      {data.map((item) => (
        <div key={item.name}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="truncate pr-2 text-slate-600">{item.name}</span>
            <span className="shrink-0 font-medium text-slate-800">
              {item.revenue.toFixed(0)} ₴ · {item.quantity} шт
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${(item.revenue / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
