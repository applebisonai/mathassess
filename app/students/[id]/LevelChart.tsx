"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

export interface ModelDef {
  key: string;
  color: string;
  maxLevel: number;
  labels: Record<number, string>;
}

export interface ChartPoint {
  date: string;
  fullDate: string;
  [model: string]: string | number | undefined;
}

function CustomTooltip({ active, payload, modelDefs }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs min-w-[180px]">
      <div className="font-semibold text-gray-700 mb-2">{payload[0]?.payload?.fullDate}</div>
      {payload.map((entry: any) => {
        const def: ModelDef | undefined = modelDefs.find((m: ModelDef) => m.key === entry.dataKey);
        const levelName = def?.labels[entry.value] ?? "";
        return (
          <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
            <span className="font-bold" style={{ color: entry.color }}>{entry.dataKey}</span>
            <span className="text-gray-600">L{entry.value}{levelName ? ` — ${levelName}` : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

function CustomDot(props: any) {
  const { cx, cy, fill } = props;
  return <circle cx={cx} cy={cy} r={5} fill={fill} stroke="#fff" strokeWidth={2} />;
}

interface LevelChartProps {
  title: string;
  subtitle: string;
  data: ChartPoint[];
  modelDefs: ModelDef[];
}

export default function LevelChart({ title, subtitle, data, modelDefs }: LevelChartProps) {
  // Only show models that actually have data
  const activeModels = modelDefs.filter((m) => data.some((d) => d[m.key] !== undefined));
  if (activeModels.length === 0 || data.length === 0) return null;

  const maxY = Math.max(...activeModels.map((m) => m.maxLevel));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-1 h-5 rounded-full bg-blue-500" />
          <h2 className="text-sm font-bold text-gray-800">{title}</h2>
        </div>
        <p className="text-xs text-gray-400 ml-3">{subtitle} · Progress Over Time</p>
      </div>

      {data.length === 1 ? (
        <>
          <p className="text-xs text-gray-400 text-center py-2 mb-3">
            Complete more assessments to see a progress line.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {activeModels.map((m) => {
              const level = data[0][m.key] as number | undefined;
              if (level === undefined) return null;
              return (
                <div key={m.key} className="text-center px-4 py-3 rounded-xl border-2 min-w-[80px]"
                  style={{ borderColor: m.color }}>
                  <div className="text-xs font-bold mb-1" style={{ color: m.color }}>{m.key}</div>
                  <div className="text-2xl font-black" style={{ color: m.color }}>{level}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-tight max-w-[100px]">
                    {m.labels[level] ?? ""}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              domain={[0, maxY]}
              ticks={Array.from({ length: maxY + 1 }, (_, i) => i)}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              width={28}
              tickFormatter={(v) => `L${v}`}
            />
            <Tooltip content={<CustomTooltip modelDefs={activeModels} />} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
              formatter={(value) => {
                const def = activeModels.find((m) => m.key === value);
                return <span style={{ color: def?.color ?? "#666" }}>{value}</span>;
              }}
            />
            {activeModels.map((m) => (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                stroke={m.color}
                strokeWidth={2.5}
                dot={<CustomDot fill={m.color} />}
                activeDot={{ r: 7 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
