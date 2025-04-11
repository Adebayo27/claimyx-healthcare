"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, type TooltipProps } from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"
interface IData{
  count: number,
  amount: number
}


interface StatusDistributionChartProps {
  pending: IData
  approved: IData
  denied: IData
}

export function StatusDistributionChart({ pending, approved, denied }: StatusDistributionChartProps) {
  const data = [
    { name: "Pending", value: pending.count, amount: pending.amount, color: "#fbbf24" }, // amber-400
    { name: "Approved", value: approved.count, amount: approved.amount, color: "#22c55e" }, // green-500
    { name: "Denied", value: denied.count, amount: denied.amount, color: "#ef4444" }, // red-500
  ]

  // Custom tooltip formatter
  const customTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      console.log(data)
      return (
        <div className="bg-background p-2 border rounded-md shadow-sm">
          <p className="font-medium">{`${data.name}: ${data.value} claims`}</p>
          <p className="font-medium">{`${data.name}: $${data.amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}</p>
          <p className="text-xs text-muted-foreground">
            {`${((data.value / (pending.count + approved.count + denied.count)) * 100).toFixed(1)}% of total`}
          </p>
        </div>
      )
    }
    return null
  }

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
        <Tooltip content={customTooltip} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
