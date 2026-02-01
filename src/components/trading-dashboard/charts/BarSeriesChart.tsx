"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type BarSeries = {
  key: string;
  color: string;
  name?: string;
};

type BarSeriesChartProps = {
  data: Record<string, number | string | null>[];
  xKey: string;
  series: BarSeries[];
};

const BarSeriesChart = ({ data, xKey, series }: BarSeriesChartProps) => (
  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip />
      <Legend />
      {series.map((item) => (
        <Bar key={item.key} dataKey={item.key} fill={item.color} name={item.name} />
      ))}
    </BarChart>
  </ResponsiveContainer>
);

export default BarSeriesChart;
