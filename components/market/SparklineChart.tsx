"use client";

import { LineChart, Line, YAxis, ResponsiveContainer } from "recharts";
import type { PricePoint } from "@/lib/market-data";

interface SparklineChartProps {
  data: PricePoint[];
  isUp: boolean;
  width?: number;
  height?: number;
}

export function SparklineChart({
  data,
  isUp,
  width = 80,
  height = 32,
}: SparklineChartProps) {
  if (!data || data.length < 2) return <div style={{ width, height }} />;

  const color = isUp ? "#00C805" : "#FF5000";
  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const padding = (max - min) * 0.1 || 1;

  return (
    <div style={{ width, height, flexShrink: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={[min - padding, max + padding]} hide />
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
