import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector,
} from "recharts";
import { useState } from "react";

const COLORS = [
  "#4f46e5",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#14b8a6",
  "#8b5cf6",
  "#ec4899",
  "#22d3ee",
];

type PieBlockProps = {
  title: string;
  data: { type: string; count: number }[];
};

export function PieBlock({ title, data }: PieBlockProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.reduce((acc, item) => acc + item.count, 0);
  const chartData = data.map((item) => ({ ...item, __total: total }));

  const onPieEnter = (_: any, index: number) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(null);

  return (
    <div
      className="rounded bg-white p-6 shadow transition hover:shadow-lg"
      style={{ flex: "1 1 300px", height: 320, paddingBottom: 24 }}
    >
      <h2 className="mb-4 text-center text-lg font-semibold">{title}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            fill="#8884d8"
            dataKey="count"
            nameKey="type"
            minAngle={5}
            activeIndex={activeIndex ?? undefined}
            activeShape={renderActiveShape}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            label={renderCustomizedLabel}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatPercent(value: number): string {
  if (value < 1 && value > 0) {
    return "0.1";
  }
  return value.toFixed(1);
}

// Кастомный label с отступом от края, чтобы текст не наезжал на край круга
function renderCustomizedLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  payload,
}: any) {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const percent100 = percent * 100;
  const displayPercent = formatPercent(percent100);

  return (
    <text
      x={x}
      y={y}
      fill="#333"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-semibold select-none"
    >
      {`${payload.type} ${displayPercent}%`}
    </text>
  );
}

function renderActiveShape(props: any) {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
  } = props;

  const rawPercent = (value / payload.__total) * 100;
  const percent = formatPercent(rawPercent);

  return (
    <g>
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fill={fill}
        className="font-bold text-sm select-none"
      >
        {payload.type}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fill="#333"
        className="text-xs select-none"
      >
        {`${value} (${percent}%)`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
}

function CustomPieTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const { type, count, __total } = payload[0].payload;
    const rawPercent = (count / __total) * 100;
    const percent = formatPercent(rawPercent);

    return (
      <div className="rounded bg-white px-4 py-2 shadow text-sm select-none">
        <p className="font-semibold">{type}</p>
        <p>
          Количество: <span className="font-bold">{count}</span>
        </p>
        <p>
          Доля: <span className="text-indigo-600 font-medium">{percent}%</span>
        </p>
      </div>
    );
  }

  return null;
}
