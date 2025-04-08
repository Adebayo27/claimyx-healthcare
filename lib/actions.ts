"use server"

import { type Claim, extendedMockClaims } from "@/lib/data"

export async function fetchClaims(): Promise<Claim[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return extendedMockClaims
}

export async function fetchClaimsSummary() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const claims = extendedMockClaims

  const totalAmount = claims.reduce((sum, claim) => sum + claim.amount, 0)

  const statusCounts = {
    Pending: claims.filter((claim) => claim.payment_status === "Pending").length,
    Approved: claims.filter((claim) => claim.payment_status === "Approved").length,
    Denied: claims.filter((claim) => claim.payment_status === "Denied").length,
  }

  const statusAmounts = {
    Pending: claims.filter((claim) => claim.payment_status === "Pending").reduce((sum, claim) => sum + claim.amount, 0),
    Approved: claims
      .filter((claim) => claim.payment_status === "Approved")
      .reduce((sum, claim) => sum + claim.amount, 0),
    Denied: claims.filter((claim) => claim.payment_status === "Denied").reduce((sum, claim) => sum + claim.amount, 0),
  }
  
  // Get all unique insurance providers
  const insuranceProviders = Array.from(new Set(claims.map((claim) => claim.insurance_provider)))

  // Generate insurance provider data
  const providerAmounts = insuranceProviders.map((provider) => ({
    provider,
    amount: claims
      .filter((claim) => claim.insurance_provider === provider)
      .reduce((sum, claim) => sum + claim.amount, 0),
    count: claims.filter((claim) => claim.insurance_provider === provider).length,
  }))

  return {
    totalAmount,
    totalClaims: claims.length,
    statusCounts,
    statusAmounts,
    providerAmounts,
  }
}
