"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type MonthlyPoint = {
  month: string;
  revenue: number;
  profit: number;
};

function formatFCFA(value: number) {
  return `${value.toLocaleString("fr-FR")} F`;
}

export function RevenueTrendChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEEDF7" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#8A8896", fontWeight: 600 }}
          axisLine={{ stroke: "#EEEDF7" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#8A8896", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toLocaleString("fr-FR")}k`}
          width={45}
        />
        <Tooltip
          formatter={(value, name) => [
            formatFCFA(Number(value)),
            name === "revenue" ? "Chiffre d'affaires" : "Bénéfice net",
          ]}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #EEEDF7",
            fontSize: 12,
            fontWeight: 600,
          }}
        />
        <Legend
          formatter={(value) => (value === "revenue" ? "Chiffre d'affaires" : "Bénéfice net")}
          wrapperStyle={{ fontSize: 11, fontWeight: 700 }}
        />
        <Bar dataKey="revenue" fill="#5B4FE8" radius={[6, 6, 0, 0]} maxBarSize={28} />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#16C79A"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "#16C79A" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
