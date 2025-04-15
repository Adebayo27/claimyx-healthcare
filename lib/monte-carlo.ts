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
    function monteCarloRevenueSimulation(claims, approvedProbability, denialProbability, pendingProbability, numTrials) {
      // Validate probabilities are between 0 and 1
      if (approvedProbability < 0 || approvedProbability > 1 ||
          denialProbability < 0 || denialProbability > 1 ||
          pendingProbability < 0 || pendingProbability > 1) {
        throw new Error("Probabilities must be between 0 and 1");
      }
      
      // Store all trial results for percentile calculations
      const trialResults = [];
      
      let totalRevenue = 0;
      for (let trial = 0; trial < numTrials; trial++) {
        let trialRevenue = 0;
        for (let claim of claims) {
          let successProbability;
          switch (claim.payment_status) {
            case "Approved":
              successProbability = approvedProbability;
              break;
            case "Denied":
              successProbability = denialProbability;
              break;
            case "Pending":
              successProbability = pendingProbability;
              break;
            default:
              throw new Error("Invalid payment_status: " + claim.payment_status);
          }
          if (Math.random() < successProbability) {
            trialRevenue += claim.amount;
          }
        }
        
        // Store individual trial result
        trialResults.push(trialRevenue);
        totalRevenue += trialRevenue;
        
        // Send progress updates every 100 iterations
        if (trial % 100 === 0) {
          self.postMessage({ type: "progress", progress: trial / numTrials });
        }
      }
      
      // Sort results for percentile calculations
      trialResults.sort((a, b) => a - b);
      
      // Calculate statistics
      const expectedRevenue = totalRevenue / numTrials;
      const minRevenue = trialResults[0];
      const maxRevenue = trialResults[trialResults.length - 1];
      
      // Calculate percentiles
      const p10 = trialResults[Math.floor(numTrials * 0.1)];
      const p25 = trialResults[Math.floor(numTrials * 0.25)];
      const p50 = trialResults[Math.floor(numTrials * 0.5)];
      const p75 = trialResults[Math.floor(numTrials * 0.75)];
      const p90 = trialResults[Math.floor(numTrials * 0.9)];
      
      // Create distribution for histogram
      const numBuckets = 20;
      const bucketSize = (maxRevenue - minRevenue) / numBuckets;
      const buckets = Array(numBuckets)
        .fill(0)
        .map((_, i) => minRevenue + i * bucketSize);
      const distribution = Array(numBuckets).fill(0);
      
      for (const result of trialResults) {
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
      
      try {
        // Run the simulation using the monteCarloRevenueSimulation function
        const results = monteCarloRevenueSimulation(
          claims, 
          probabilities.Approved, 
          probabilities.Denied, 
          probabilities.Pending, 
          iterations
        );
        
        // Send the results back to the main thread
        self.postMessage({ type: "complete", results });
      } catch (error) {
        self.postMessage({ type: "error", error: error.message });
      }
    };
  `

  const blob = new Blob([workerCode], { type: "application/javascript" })
  const workerUrl = URL.createObjectURL(blob)
  const worker = new Worker(workerUrl)

  // Set up message handling
  worker.onmessage = (event) => {
    const { type, results, progress, error } = event.data

    if (type === "progress" && onProgress) {
      onProgress(progress)
    } else if (type === "complete" && onComplete) {
      onComplete(results)
      // Clean up
      worker.terminate()
      URL.revokeObjectURL(workerUrl)
    } else if (type === "error") {
      console.error("Monte Carlo simulation error:", error)
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
 
  function monteCarloRevenueSimulation(
    claims: Claim[],
    approvedProbability: number,
    denialProbability: number,
    pendingProbability: number,
    numTrials: number,
  ) {
    // Validate probabilities are between 0 and 1
    if (
      approvedProbability < 0 ||
      approvedProbability > 1 ||
      denialProbability < 0 ||
      denialProbability > 1 ||
      pendingProbability < 0 ||
      pendingProbability > 1
    ) {
      throw new Error("Probabilities must be between 0 and 1")
    }

    // Store all trial results for percentile calculations
    const trialResults: number[] = []

    let totalRevenue = 0
    for (let trial = 0; trial < numTrials; trial++) {
      let trialRevenue = 0
      for (const claim of claims) {
        let successProbability
        switch (claim.payment_status) {
          case "Approved":
            successProbability = approvedProbability
            break
          case "Denied":
            successProbability = denialProbability
            break
          case "Pending":
            successProbability = pendingProbability
            break
          default:
            throw new Error(`Invalid payment_status: ${claim.payment_status}`)
        }
        if (Math.random() < successProbability) {
          trialRevenue += claim.amount
        }
      }

      // Store individual trial result
      trialResults.push(trialRevenue)
      totalRevenue += trialRevenue
    }

    return trialResults
  }

  // Run the simulation and get all trial results
  const trialResults = monteCarloRevenueSimulation(
    claims,
    probabilities.Approved,
    probabilities.Denied,
    probabilities.Pending,
    iterations,
  )

  // Sort results for percentile calculations
  trialResults.sort((a, b) => a - b)

  // Calculate statistics
  const expectedRevenue = trialResults.reduce((sum, val) => sum + val, 0) / iterations
  const minRevenue = trialResults[0]
  const maxRevenue = trialResults[trialResults.length - 1]

  // Calculate percentiles
  const p10 = trialResults[Math.floor(iterations * 0.1)]
  const p25 = trialResults[Math.floor(iterations * 0.25)]
  const p50 = trialResults[Math.floor(iterations * 0.5)]
  const p75 = trialResults[Math.floor(iterations * 0.75)]
  const p90 = trialResults[Math.floor(iterations * 0.9)]

  // Create distribution for histogram
  const numBuckets = 20
  const bucketSize = (maxRevenue - minRevenue) / numBuckets
  const buckets = Array(numBuckets)
    .fill(0)
    .map((_, i) => minRevenue + i * bucketSize)
  const distribution = Array(numBuckets).fill(0)

  for (const result of trialResults) {
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
  // Use the provided algorithm but run it in chunks
  function monteCarloRevenueSimulationChunk(
    claims: Claim[],
    approvedProbability: number,
    denialProbability: number,
    pendingProbability: number,
    startTrial: number,
    endTrial: number,
  ) {
    const chunkResults: number[] = []

    for (let trial = startTrial; trial < endTrial; trial++) {
      let trialRevenue = 0
      for (const claim of claims) {
        let successProbability
        switch (claim.payment_status) {
          case "Approved":
            successProbability = approvedProbability
            break
          case "Denied":
            successProbability = denialProbability
            break
          case "Pending":
            successProbability = pendingProbability
            break
          default:
            throw new Error(`Invalid payment_status: ${claim.payment_status}`)
        }
        if (Math.random() < successProbability) {
          trialRevenue += claim.amount
        }
      }
      chunkResults.push(trialRevenue)
    }

    return chunkResults
  }

  const results: number[] = []
  let currentIteration = 0

  function runChunk() {
    const chunkEnd = Math.min(currentIteration + chunkSize, iterations)

    try {
      const chunkResults = monteCarloRevenueSimulationChunk(
        claims,
        probabilities.Approved,
        probabilities.Denied,
        probabilities.Pending,
        currentIteration,
        chunkEnd,
      )

      results.push(...chunkResults)
    } catch (error) {
      console.error("Monte Carlo simulation error:", error)
      return
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
