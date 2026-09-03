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
        <CartesianGrid strokeDasharray="3 3" stroke="#EDE3D3" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#8A7D72", fontWeight: 600 }}
          axisLine={{ stroke: "#EDE3D3" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#8A7D72", fontWeight: 600 }}
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
            border: "1px solid #EDE3D3",
            fontSize: 12,
            fontWeight: 600,
          }}
        />
        <Legend
          formatter={(value) => (value === "revenue" ? "Chiffre d'affaires" : "Bénéfice net")}
          wrapperStyle={{ fontSize: 11, fontWeight: 700 }}
        />
        <Bar dataKey="revenue" fill="#C13317" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#1E6B4F"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "#1E6B4F" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
