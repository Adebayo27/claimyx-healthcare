import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSummary } from "@/components/dashboard-summary"
import { ClaimsTable } from "@/components/claims-table"
import { RevenueForecasting } from "@/components/revenue-forecasting"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 space-y-6 p-6">
        <h1 className="text-3xl font-bold tracking-tight">Healthcare Billing Dashboard</h1>
        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
            <DashboardSummary />
          </Suspense>

          <div className="grid gap-6 lg:grid-cols-1">
            <div className="col-span-1 space-y-6">
              <h2 className="text-2xl font-semibold">Claims Management</h2>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <ClaimsTable />
              </Suspense>
            </div>

            <div className="col-span-1 space-y-6">
              <h2 className="text-2xl font-semibold">Revenue Forecasting</h2>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <RevenueForecasting />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
