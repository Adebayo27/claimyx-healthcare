import type { Claim, PaymentProbabilities, SimulationResult } from "./monte-carlo.types"

// Re-export types
export type { Claim, PaymentProbabilities, SimulationResult }

// Function to create and use a Web Worker for Monte Carlo simulation
export function runMonteCarloSimulationWithWorker(
  claims: Claim[],
  probabilities: PaymentProbabilities,
  iterations = 2000,
  onProgress?: (progress: number) => void,
  onComplete?: (result: SimulationResult) => void,
): { cancel: () => void } {
  // Create a new worker with inline code
  const workerCode = `
    // Worker function to run Monte Carlo simulation
    function runMonteCarloSimulation(claims, probabilities, iterations) {
      // Initialize results array
      const results = [];
    
      // Run simulation iterations
      for (let i = 0; i < iterations; i++) {
        let totalRevenue = 0;
    
        // For each claim, determine if it gets paid based on status and probability
        for (const claim of claims) {
          const probability = probabilities[claim.payment_status];
          const isPaid = Math.random() < probability;
    
          if (isPaid) {
            totalRevenue += claim.amount;
          }
        }
    
        results.push(totalRevenue);
        
        // Send progress updates every 100 iterations
        if (i % 100 === 0) {
          self.postMessage({ type: "progress", progress: i / iterations });
        }
      }
    
      // Sort results for percentile calculations
      results.sort((a, b) => a - b);
    
      // Calculate statistics
      const expectedRevenue = results.reduce((sum, val) => sum + val, 0) / iterations;
      const minRevenue = results[0];
      const maxRevenue = results[results.length - 1];
    
      // Calculate percentiles
      const p10 = results[Math.floor(iterations * 0.1)];
      const p25 = results[Math.floor(iterations * 0.25)];
      const p50 = results[Math.floor(iterations * 0.5)];
      const p75 = results[Math.floor(iterations * 0.75)];
      const p90 = results[Math.floor(iterations * 0.9)];
    
      // Create distribution for histogram
      const numBuckets = 20;
      const bucketSize = (maxRevenue - minRevenue) / numBuckets;
      const buckets = Array(numBuckets)
        .fill(0)
        .map((_, i) => minRevenue + i * bucketSize);
      const distribution = Array(numBuckets).fill(0);
    
      for (const result of results) {
        const bucketIndex = Math.min(Math.floor((result - minRevenue) / bucketSize), numBuckets - 1);
        distribution[bucketIndex]++;
      }
    
      // Normalize distribution
      const maxCount = Math.max(...distribution);
      const normalizedDistribution = distribution.map((count) => count / maxCount);
    
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
      };
    }
    
    // Listen for messages from the main thread
    self.onmessage = function(event) {
      const { claims, probabilities, iterations } = event.data;
      
      // Run the simulation
      const results = runMonteCarloSimulation(claims, probabilities, iterations);
      
      // Send the results back to the main thread
      self.postMessage({ type: "complete", results });
    };
  `

  const blob = new Blob([workerCode], { type: "application/javascript" })
  const workerUrl = URL.createObjectURL(blob)
  const worker = new Worker(workerUrl)

  // Set up message handling
  worker.onmessage = (event) => {
    const { type, results, progress } = event.data

    if (type === "progress" && onProgress) {
      onProgress(progress)
    } else if (type === "complete" && onComplete) {
      onComplete(results)
      // Clean up
      worker.terminate()
      URL.revokeObjectURL(workerUrl)
    }
  }

  // Start the simulation
  worker.postMessage({ claims, probabilities, iterations })

  // Return a function to cancel the simulation
  return {
    cancel: () => {
      worker.terminate()
      URL.revokeObjectURL(workerUrl)
    },
  }
}

// Keep the original function for fallback or direct use
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
      const probability = probabilities[claim.payment_status]
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

// Function to run simulation in chunks to keep UI responsive (legacy approach)
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

      const p10 = results[Math.floor(iterations * 0.1)]
      const p25 = results[Math.floor(iterations * 0.25)]
      const p50 = results[Math.floor(iterations * 0.5)]
      const p75 = results[Math.floor(iterations * 0.75)]
      const p90 = results[Math.floor(iterations * 0.9)]

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
