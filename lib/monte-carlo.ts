"use client"

import type { Claim } from "@/lib/data"

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

// Function to run Monte Carlo simulation
export function runMonteCarloSimulation(
  claims: Claim[],
  probabilities: PaymentProbabilities,
  iterations = 2000,
): SimulationResult {
  // Initialize results array
  const results: number[] = []

  // Run simulation iterations
  for (let i = 0; i < iterations; i++) {
    let totalRevenue = 0

    // For each claim, determine if it gets paid based on status and probability
    for (const claim of claims) {
      // Use its payment_status to get the chance it'll be paid.
      const probability = probabilities[claim.payment_status]
      // Randomly determine if it's paid or not.
      const isPaid = Math.random() < probability

      if (isPaid) {
        totalRevenue += claim.amount
      }
    }

    results.push(totalRevenue)
  }

  // Sort results for percentile calculations
  results.sort((a, b) => a - b)

  // Calculate statistics
  const expectedRevenue = results.reduce((sum, val) => sum + val, 0) / iterations
  const minRevenue = results[0]
  const maxRevenue = results[results.length - 1]

  // Calculate percentiles
  const p10 = results[Math.floor(iterations * 0.1)]
  const p25 = results[Math.floor(iterations * 0.25)]
  const p50 = results[Math.floor(iterations * 0.5)]
  const p75 = results[Math.floor(iterations * 0.75)]
  const p90 = results[Math.floor(iterations * 0.9)]

  // Create distribution for histogram
  const numBuckets = 20
  const bucketSize = (maxRevenue - minRevenue) / numBuckets
  const buckets = Array(numBuckets)
    .fill(0)
    .map((_, i) => minRevenue + i * bucketSize)
  const distribution = Array(numBuckets).fill(0)

  for (const result of results) {
    const bucketIndex = Math.min(Math.floor((result - minRevenue) / bucketSize), numBuckets - 1)
    distribution[bucketIndex]++
  }

  // Normalize distribution
  const maxCount = Math.max(...distribution)
  const normalizedDistribution = distribution.map((count) => count / maxCount)

  return {
    expectedRevenue,
    minRevenue,
    maxRevenue,
    percentiles: {
      p10,
      p25,
      p50,
      p75,
      p90,
    },
    distribution: normalizedDistribution,
    buckets,
  }
}

// Function to run simulation in chunks to keep UI responsive
export function runMonteCarloSimulationInChunks(
  claims: Claim[],
  probabilities: PaymentProbabilities,
  iterations = 2000,
  chunkSize = 200,
  onProgress?: (progress: number) => void,
  onComplete?: (result: SimulationResult) => void,
) {
  const results: number[] = []
  let currentIteration = 0

  function runChunk() {
    const chunkEnd = Math.min(currentIteration + chunkSize, iterations)

    for (let i = currentIteration; i < chunkEnd; i++) {
      let totalRevenue = 0

      for (const claim of claims) {
        const probability = probabilities[claim.payment_status]
        const isPaid = Math.random() < probability

        if (isPaid) {
          totalRevenue += claim.amount
        }
      }

      results.push(totalRevenue)
    }

    currentIteration = chunkEnd

    if (onProgress) {
      onProgress(currentIteration / iterations)
    }

    if (currentIteration < iterations) {
      // Schedule next chunk with requestAnimationFrame to keep UI responsive
      requestAnimationFrame(runChunk)
    } else {
      // Simulation complete, calculate final results
      results.sort((a, b) => a - b)

      const expectedRevenue = results.reduce((sum, val) => sum + val, 0) / iterations
      const minRevenue = results[0]
      const maxRevenue = results[results.length - 1]

      // Pick revenue values at various percentiles:
      const p10 = results[Math.floor(iterations * 0.1)]
      const p25 = results[Math.floor(iterations * 0.25)]
      const p50 = results[Math.floor(iterations * 0.5)]
      const p75 = results[Math.floor(iterations * 0.75)]
      const p90 = results[Math.floor(iterations * 0.9)]

      // Create Histogram Distribution
      const numBuckets = 20
      const bucketSize = (maxRevenue - minRevenue) / numBuckets

      // Divide the range of revenue into 20 equal parts (buckets) to build a histogram
      const buckets = Array(numBuckets)
        .fill(0)
        .map((_, i) => minRevenue + i * bucketSize)
      const distribution = Array(numBuckets).fill(0)

      for (const result of results) {
        const bucketIndex = Math.min(Math.floor((result - minRevenue) / bucketSize), numBuckets - 1)
        distribution[bucketIndex]++
      }

      const maxCount = Math.max(...distribution)
      const normalizedDistribution = distribution.map((count) => count / maxCount)

      const finalResult: SimulationResult = {
        expectedRevenue,
        minRevenue,
        maxRevenue,
        percentiles: {
          p10,
          p25,
          p50,
          p75,
          p90,
        },
        distribution: normalizedDistribution,
        buckets,
      }

      if (onComplete) {
        onComplete(finalResult)
      }
    }
  }

  // Start the first chunk
  runChunk()
}
