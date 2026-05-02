"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Shift } from "@/lib/types";
import { formatRupiah } from "@/lib/format";

interface IncomeChartProps {
  shifts: Shift[];
}

export function IncomeChart({ shifts }: IncomeChartProps) {
  // Sort shifts chronologically for the chart (they are probably fetched descending)
  const chartData = [...shifts].reverse().map(shift => {
    // format date as "DD/MM"
    const dateObj = new Date(shift.date);
    const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
    
    return {
      date: dateStr,
      "Pendapatan Kotor": shift.gross_income,
      "Pendapatan Bersih": shift.net_income,
    };
  });

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EE4D2D" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EE4D2D" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(1 0 0 / 10%)" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: "oklch(0.65 0 0)" }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: "oklch(0.65 0 0)" }}
            tickFormatter={(value) => `Rp${value / 1000}k`}
          />
          <Tooltip 
            formatter={(value: number) => formatRupiah(value)}
            contentStyle={{ 
              backgroundColor: "oklch(0.19 0 0)", 
              borderColor: "oklch(1 0 0 / 10%)",
              borderRadius: "0.5rem",
              color: "#fff"
            }}
            itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
            labelStyle={{ fontSize: "12px", color: "oklch(0.65 0 0)", marginBottom: "4px" }}
          />
          <Area 
            type="monotone" 
            dataKey="Pendapatan Kotor" 
            stroke="#6b7280" 
            fillOpacity={1} 
            fill="url(#colorGross)" 
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="Pendapatan Bersih" 
            stroke="#EE4D2D" 
            fillOpacity={1} 
            fill="url(#colorNet)" 
            strokeWidth={3}
            activeDot={{ r: 6, fill: "#EE4D2D", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
