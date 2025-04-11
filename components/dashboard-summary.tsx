import { fetchClaimsSummary } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDistributionChart } from "@/components/status-distribution-chart";

export async function DashboardSummary() {
  const summary = await fetchClaimsSummary();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Billing Amount
          </CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            $
            {summary.totalAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Across {summary.totalClaims} claims
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-amber-500"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.statusCounts.Pending}
          </div>
          <p className="text-md">
            $
            {summary.statusAmounts.Pending.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved Claims</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-green-500"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.statusCounts.Approved}
          </div>
          <p className="text-md">
            $
            {summary.statusAmounts.Approved.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Denied Claims</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-red-500"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.statusCounts.Denied}
          </div>
          <p className="text-md">
            $
            {summary.statusAmounts.Denied.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle>Claims Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusDistributionChart
            pending={{
              count: summary.statusCounts.Pending,
              amount: summary.statusAmounts.Pending,
            }}
            approved={{
              count: summary.statusCounts.Approved,
              amount: summary.statusAmounts.Approved,
            }}
            denied={{
              count: summary.statusCounts.Denied,
              amount: summary.statusAmounts.Denied,
            }}
          />
        </CardContent>
      </Card>

      <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle>Insurance Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.providerAmounts.map((item) => (
              <div
                key={item.provider}
                className="flex items-center flex-col md:flex-row"
              >
                <div className="w-full md:w-[30%] font-medium truncate">
                  {item.provider}
                </div>
                <div className="w-full md:w-[50%] flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(item.amount / summary.totalAmount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-full md:w-[20%] text-right text-sm">
                  $
                  {item.amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
