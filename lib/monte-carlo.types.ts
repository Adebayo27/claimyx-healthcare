export type Claim = {
    patient_id: string
    patient_name: string
    billing_code: string
    amount: number
    insurance_provider: string
    payment_status: "Pending" | "Approved" | "Denied"
    claim_date: string
  }
  
  export type PaymentProbabilities = {
    Pending: number
    Approved: number
    Denied: number
  }
  
  export type SimulationResult = {
    expectedRevenue: number
    minRevenue: number
    maxRevenue: number
    percentiles: {
      p10: number
      p25: number
      p50: number
      p75: number
      p90: number
    }
    distribution: number[]
    buckets: number[]
  }
  