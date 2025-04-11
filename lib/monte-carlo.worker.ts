import type { Claim, PaymentProbabilities, SimulationResult } from "./monte-carlo.types"

// Listen for messages from the main thread
self.onmessage = (event) => {
  const { claims, probabilities, iterations, chunkSize } = event.data

  // Run the simulation
  const results = runMonteCarloSimulation(claims, probabilities, iterations)

  // Send the results back to the main thread
  self.postMessage({ type: "complete", results })
}

// Function to run Monte Carlo simulation
function runMonteCarloSimulation(
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
      const probability = probabilities[claim.payment_status]
      const isPaid = Math.random() < probability

      if (isPaid) {
        totalRevenue += claim.amount
      }
    }

    results.push(totalRevenue)

    // Send progress updates every 100 iterations
    if (i % 100 === 0) {
      self.postMessage({ type: "progress", progress: i / iterations })
    }
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
