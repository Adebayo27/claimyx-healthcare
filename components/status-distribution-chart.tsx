"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface StatusDistributionChartProps {
  pending: number
  approved: number
  denied: number
}

export function StatusDistributionChart({ pending, approved, denied }: StatusDistributionChartProps) {
  const data = [
    { name: "Pending", value: pending, color: "#fbbf24" }, // amber-400
    { name: "Approved", value: approved, color: "#22c55e" }, // green-500
    { name: "Denied", value: denied, color: "#ef4444" }, // red-500
  ]

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={50}
          fill="#8884d8"
          dataKey="value"
          // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} claims`, ""]} labelFormatter={() => ""} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
