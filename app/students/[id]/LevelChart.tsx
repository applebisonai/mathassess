"use client";
import { useState } from "react";
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

/** Parse "YYYY-MM-DD" as a local date (no UTC shift). */
function parseLocalDate(raw: string): string {
  const [yr, mo, dy] = raw.split("-").map(Number);
  const d = new Date(yr, mo - 1, dy);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function CustomTooltip({ active, payload, modelDefs }: any) {
  if (!active || !payload?.length) return null;
  const rawDate: string = payload[0]?.payload?.fullDate ?? "";
  const fullDate = rawDate ? parseLocalDate(rawDate) : "";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-3 text-xs min-w-[200px]">
      <div className="font-semibold text-gray-500 text-xs mb-3 border-b border-gray-100 pb-2">
        {fullDate}
      </div>
      <div className="flex flex-wrap gap-2">
        {payload.map((entry: any) => {
          const def: ModelDef | undefined = modelDefs.find(
            (m: ModelDef) => m.key === entry.dataKey
          );
          const level = entry.value as number;
          const levelName = def?.labels[level] ?? "";
          return (
            <div
              key={entry.dataKey}
              className="rounded-xl border-2 px-3 py-2 min-w-[72px] text-center bg-white"
              style={{ borderColor: entry.color }}
            >
              <div
                className="text-xs font-bold uppercase tracking-wide mb-0.5"
                style={{ color: entry.color }}
              >
                {entry.dataKey}
              </div>
              <div
                className="text-xl font-black leading-none mb-1"
                style={{ color: entry.color }}
              >
                {level}
              </div>
              <div className="text-gray-500 leading-snug" style={{ fontSize: "10px", maxWidth: "80px" }}>
                {levelName}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CustomDot(props: any) {
  const { cx, cy, fill } = props;
  return <circle cx={cx} cy={cy} r={5} fill={fill} stroke="#fff" strokeWidth={2} />;
}

/**
 * Cursor that snaps to the actual data-point x-position (from recharts `points` prop)
 * rather than following the raw mouse x.  This keeps the vertical guide line
 * exactly under the hovered dot so it visually matches the tooltip values.
 */
function SnapCursor({ points, height }: any) {
  if (!points?.length) return null;
  const x = points[0].x;
  return (
    <line
      x1={x} y1={0} x2={x} y2={height}
      stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4"
    />
  );
}

interface LevelChartProps {
  title: string;
  subtitle: string;
  data: ChartPoint[];
  modelDefs: ModelDef[];
}

export default function LevelChart({ title, subtitle, data, modelDefs }: LevelChartProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Only show models that actually have data
  const activeModels = modelDefs.filter((m) => data.some((d) => d[m.key] !== undefined));

  // Empty state — no assessments completed yet for this schedule
  if (activeModels.length === 0 || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-1 h-5 rounded-full bg-blue-500" />
              <h2 className="text-sm font-bold text-gray-800">{title}</h2>
            </div>
            <p className="text-xs text-gray-400 ml-3">{subtitle} · Progress Over Time</p>
          </div>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {collapsed ? "▼ Show" : "▲ Hide"}
          </button>
        </div>
        {!collapsed && (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            <div className="flex gap-2">
              {modelDefs.map((m) => (
                <div key={m.key} className="rounded-xl border-2 px-3 py-2 min-w-[64px] opacity-30"
                  style={{ borderColor: m.color }}>
                  <div className="text-xs font-bold uppercase tracking-wide" style={{ color: m.color }}>{m.key}</div>
                  <div className="text-xl font-black text-gray-300">—</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">No assessments completed yet. Complete this schedule to see results here.</p>
          </div>
        )}
      </div>
    );
  }

  const maxY = Math.max(...activeModels.map((m) => m.maxLevel));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1 h-5 rounded-full bg-blue-500" />
            <h2 className="text-sm font-bold text-gray-800">{title}</h2>
          </div>
          <p className="text-xs text-gray-400 ml-3">{subtitle} · Progress Over Time</p>
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {collapsed ? "▼ Show" : "▲ Hide"}
        </button>
      </div>

      {!collapsed && (data.length === 1 ? (
        <>
          <p className="text-xs text-gray-400 text-center py-2 mb-3">
            Complete more assessments to see a progress line.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {activeModels.map((m) => {
              const level = data[0][m.key] as number | undefined;
              if (level === undefined) return null;
              return (
                <div
                  key={m.key}
                  className="text-center px-4 py-3 rounded-xl border-2 min-w-[80px] bg-white"
                  style={{ borderColor: m.color }}
                >
                  <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: m.color }}>
                    {m.key}
                  </div>
                  <div className="text-2xl font-black leading-none mb-1" style={{ color: m.color }}>
                    {level}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-tight max-w-[100px]">
                    {m.labels[level] ?? ""}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={data}
            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tickFormatter={(v: string) => {
                // key format: "YYYY-MM-DD_idx" — strip suffix and parse as local date
                const raw = v.split("_")[0];
                const [yr, mo, dy] = raw.split("-").map(Number);
                const d = new Date(yr, mo - 1, dy);
                return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
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
            <Tooltip
              content={(props) => (
                <CustomTooltip {...props} modelDefs={activeModels} />
              )}
              cursor={<SnapCursor />}
              position={{ x: 32, y: 4 }}
            />
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
                type="linear"
                dataKey={m.key}
                stroke={m.color}
                strokeWidth={2.5}
                dot={<CustomDot fill={m.color} />}
                activeDot={{ r: 7, stroke: m.color, strokeWidth: 2, fill: "#fff" }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ))}
    </div>
  );
}
