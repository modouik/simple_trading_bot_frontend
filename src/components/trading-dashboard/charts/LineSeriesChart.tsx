"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type LineSeries = {
  key: string;
  color: string;
  name?: string;
};

type LineSeriesChartProps = {
  data: Record<string, number | string | null>[];
  xKey: string;
  series: LineSeries[];
};

const LineSeriesChart = ({ data, xKey, series }: LineSeriesChartProps) => (
  <ResponsiveContainer width="100%" height={260}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip />
      <Legend />
      {series.map((item) => (
        <Line
          key={item.key}
          type="monotone"
          dataKey={item.key}
          name={item.name || item.key}
          stroke={item.color}
          dot={false}
          strokeWidth={2}
        />
      ))}
    </LineChart>
  </ResponsiveContainer>
);

export default LineSeriesChart;
