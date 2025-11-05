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
  "#3B82F6", // blue-500
  "#10B981", // green-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#8B5CF6", // violet-500
  "#06B6D4", // cyan-500
  "#EC4899", // pink-500
  "#84CC16", // lime-500
  "#F97316", // orange-500
];

type PieBlockProps = {
  title: string;
  data: { type: string; count: number }[];
  colors?: string[];
};

export function PieBlock({ title, data, colors = COLORS }: PieBlockProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.reduce((acc, item) => acc + item.count, 0);
  const chartData = data.map((item) => ({ ...item, __total: total }));

  const onPieEnter = (_: any, index: number) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(null);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center h-80">
        <div className="text-gray-400 text-4xl mb-4">📊</div>
        <p className="text-gray-500 text-center">Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
        {title}
      </h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="count"
              nameKey="type"
              minAngle={5}
              activeIndex={activeIndex ?? undefined}
              activeShape={renderActiveShape}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  stroke="#fff"
                  strokeWidth={2}
                  className="transition-all duration-200 hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-xs text-gray-600">{value}</span>
              )}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Дополнительная информация под графиком */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Всего:</span>
          <span className="font-semibold text-gray-900">{total}</span>
        </div>
        {activeIndex !== null && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900">
                {chartData[activeIndex].type}
              </span>
              <span className="text-sm font-bold text-blue-700">
                {((chartData[activeIndex].count / total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatPercent(value: number): string {
  if (value < 1 && value > 0) {
    return "0.1";
  }
  return value.toFixed(1);
}

// Улучшенный label с лучшей читаемостью
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
  if (percent < 0.05) return null; // Не показываем label для маленьких сегментов

  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const percent100 = percent * 100;
  const displayPercent = formatPercent(percent100);

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-medium select-none pointer-events-none"
      style={{
        textShadow: '1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white',
      }}
    >
      {`${displayPercent}%`}
    </text>
  );
}

// Улучшенный активный сектор с анимацией
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
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="transition-all duration-200"
      />
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        fill="#1F2937"
        className="font-bold text-sm select-none pointer-events-none"
        style={{
          textShadow: '1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white',
        }}
      >
        {payload.type.length > 12 ? payload.type.substring(0, 12) + '...' : payload.type}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fill="#4B5563"
        className="text-xs font-semibold select-none pointer-events-none"
        style={{
          textShadow: '1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white',
        }}
      >
        {`${value} (${percent}%)`}
      </text>
    </g>
  );
}

// Улучшенный тултип
function CustomPieTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const { type, count, __total } = payload[0].payload;
    const rawPercent = (count / __total) * 100;
    const percent = formatPercent(rawPercent);

    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl border border-gray-700">
        <div className="text-sm font-semibold mb-1 text-white">{type}</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <span className="text-gray-300">Количество:</span>
          <span className="font-bold text-white text-right">{count.toLocaleString()}</span>
          
          <span className="text-gray-300">Доля:</span>
          <span className="font-semibold text-blue-300 text-right">{percent}%</span>
          
          <span className="text-gray-300">Всего:</span>
          <span className="text-gray-300 text-right">{__total.toLocaleString()}</span>
        </div>
      </div>
    );
  }

  return null;
}

// Дополнительный компонент для мини-версии PieBlock (если нужно)
export function MiniPieBlock({ title, data, colors = COLORS }: PieBlockProps) {
  const total = data.reduce((acc, item) => acc + item.count, 0);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center h-48">
        <div className="text-gray-400 text-2xl mb-2">📊</div>
        <p className="text-gray-500 text-sm text-center">Нет данных</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 text-center">
        {title}
      </h3>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={45}
              innerRadius={20}
              dataKey="count"
              nameKey="type"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  stroke="#fff"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-2">
        <span className="text-xs text-gray-600">Всего: {total}</span>
      </div>
    </div>
  );
}