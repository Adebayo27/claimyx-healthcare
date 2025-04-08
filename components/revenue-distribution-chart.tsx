"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

interface RevenueDistributionChartProps {
  distribution: number[]
  buckets: number[]
  percentiles: {
    p10: number
    p25: number
    p50: number
    p75: number
    p90: number
  }
}

export function RevenueDistributionChart({ distribution, buckets, percentiles }: RevenueDistributionChartProps) {
  // Convert the distribution data to the format expected by Recharts
  const chartData = distribution.map((value, index) => {
    const bucketValue = buckets[index]
    const formattedValue = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(bucketValue)

    return {
      bucket: formattedValue,
      value: value * 100, // Scale the normalized values for better visibility
      rawValue: bucketValue,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="bucket"
          angle={-45}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 10 }}
          interval={Math.ceil(chartData.length / 10)} // Show fewer ticks for readability
        />
        <YAxis hide />
        <Tooltip
          formatter={(value) => [`Frequency: ${((value as number) / 100).toFixed(2)}`, ""]}
          labelFormatter={(label) => `Revenue: ${label}`}
        />
        <Bar dataKey="value" fill="rgba(147, 51, 234, 0.5)" stroke="rgb(147, 51, 234)" />

        {/* Reference lines for percentiles */}
        <ReferenceLine
          x={
            chartData.findIndex((item) => item.rawValue >= percentiles.p50) >= 0
              ? chartData[chartData.findIndex((item) => item.rawValue >= percentiles.p50)].bucket
              : undefined
          }
          stroke="rgb(220, 38, 38)"
          strokeWidth={2}
          // label={{ value: "Median", position: "top", fill: "rgb(220, 38, 38)" }}
        />

        <ReferenceLine
          x={
            chartData.findIndex((item) => item.rawValue >= percentiles.p25) >= 0
              ? chartData[chartData.findIndex((item) => item.rawValue >= percentiles.p25)].bucket
              : undefined
          }
          stroke="rgb(245, 158, 11)"
          strokeDasharray="5 5"
          label={{ value: "25%", position: "top", fill: "rgb(245, 158, 11)" }}
        />

        <ReferenceLine
          x={
            chartData.findIndex((item) => item.rawValue >= percentiles.p75) >= 0
              ? chartData[chartData.findIndex((item) => item.rawValue >= percentiles.p75)].bucket
              : undefined
          }
          stroke="rgb(245, 158, 11)"
          strokeDasharray="5 5"
          label={{ value: "75%", position: "top", fill: "rgb(245, 158, 11)" }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
