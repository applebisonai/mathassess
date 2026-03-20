"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Dot,
} from "recharts";

export interface ChartPoint {
  date: string;        // formatted display date e.g. "Jan 15"
  fullDate: string;    // full date for tooltip e.g. "January 15, 2025"
  FNWS?: number;
  BNWS?: number;
  NID?: number;
}

const MODEL_COLORS = {
  FNWS: "#f59e0b",  // amber/orange
  BNWS: "#ef4444",  // red
  NID:  "#06b6d4",  // cyan
};

const FNWS_LABELS: Record<number, string> = {
  0: "Emergent",
  1: "Initial to 'ten'",
  2: "Intermediate to 'ten'",
  3: "Facile to 'ten'",
  4: "Facile to 'thirty'",
  5: "Facile to 'hundred'",
  6: "Facile to 'thousand'",
  7: "Facile to 'ten thousand'",
};
const BNWS_LABELS: Record<number, string> = {
  0: "Emergent",
  1: "Initial to 'ten'",
  2: "Intermediate to 'ten'",
  3: "Facile to 'ten'",
  4: "Facile to 'thirty'",
  5: "Facile to 'hundred'",
};
const NID_LABELS: Record<number, string> = {
  0: "Emergent",
  1: "Numerals to 10",
  2: "Numerals to 20",
  3: "Numerals to 100",
  4: "Numerals to 1,000",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs">
      <div className="font-semibold text-gray-700 mb-2">{payload[0]?.payload?.fullDate}</div>
      {payload.map((entry: any) => {
        const model = entry.dataKey as keyof typeof MODEL_COLORS;
        const labelMap = model === "FNWS" ? FNWS_LABELS : model === "BNWS" ? BNWS_LABELS : NID_LABELS;
        return (
          <div key={model} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
            <span className="font-bold" style={{ color: entry.color }}>{model}</span>
            <span className="text-gray-600">Level {entry.value} — {labelMap[entry.value] ?? ""}</span>
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

export default function LevelChart({ data, models }: { data: ChartPoint[]; models: string[] }) {
  if (data.length < 1) return null;

  // Max Y based on which models are present
  const maxY = models.includes("FNWS") ? 7 : models.includes("BNWS") ? 5 : 4;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
      <h2 className="text-base font-semibold text-gray-700 mb-4">Progress Over Time</h2>
      {data.length === 1 ? (
        <p className="text-xs text-gray-400 text-center py-4">
          Complete more assessments to see progress over time.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
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
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              formatter={(value) => (
                <span style={{ color: MODEL_COLORS[value as keyof typeof MODEL_COLORS] ?? "#666" }}>
                  {value}
                </span>
              )}
            />
            {models.includes("FNWS") && (
              <Line
                type="monotone"
                dataKey="FNWS"
                stroke={MODEL_COLORS.FNWS}
                strokeWidth={2.5}
                dot={<CustomDot fill={MODEL_COLORS.FNWS} />}
                activeDot={{ r: 7 }}
                connectNulls
              />
            )}
            {models.includes("BNWS") && (
              <Line
                type="monotone"
                dataKey="BNWS"
                stroke={MODEL_COLORS.BNWS}
                strokeWidth={2.5}
                dot={<CustomDot fill={MODEL_COLORS.BNWS} />}
                activeDot={{ r: 7 }}
                connectNulls
              />
            )}
            {models.includes("NID") && (
              <Line
                type="monotone"
                dataKey="NID"
                stroke={MODEL_COLORS.NID}
                strokeWidth={2.5}
                dot={<CustomDot fill={MODEL_COLORS.NID} />}
                activeDot={{ r: 7 }}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Single-assessment snapshot */}
      {data.length === 1 && (
        <div className="flex justify-center gap-4 mt-2">
          {models.map((model) => {
            const level = data[0][model as keyof ChartPoint];
            if (level === undefined) return null;
            const color = MODEL_COLORS[model as keyof typeof MODEL_COLORS];
            const labelMap = model === "FNWS" ? FNWS_LABELS : model === "BNWS" ? BNWS_LABELS : NID_LABELS;
            return (
              <div key={model} className="text-center px-4 py-3 rounded-xl border-2" style={{ borderColor: color }}>
                <div className="text-xs font-bold mb-1" style={{ color }}>{model}</div>
                <div className="text-2xl font-bold" style={{ color }}>{String(level)}</div>
                <div className="text-xs text-gray-500 mt-0.5">{labelMap[Number(level)] ?? ""}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
