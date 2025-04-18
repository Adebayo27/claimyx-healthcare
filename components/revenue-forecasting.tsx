"use client"

import { useState, useEffect, useRef } from "react"
import { fetchClaims } from "@/lib/actions"
import type { Claim } from "@/lib/data"
import { type PaymentProbabilities, type SimulationResult, runMonteCarloSimulationWithWorker } from "@/lib/monte-carlo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RevenueDistributionChart } from "@/components/revenue-distribution-chart"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function RevenueForecasting() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [probabilities, setProbabilities] = useState<PaymentProbabilities>({
    Pending: 0.5,
    Approved: 0.5,
    Denied: 0.5,
  })
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [displayProgress, setDisplayProgress] = useState(0) // For smooth animation
  const [loading, setLoading] = useState(true)
  const [workerSupported, setWorkerSupported] = useState(true)

  // Use a ref to track if we need to auto-run simulation when claims load
  const initialSimulationRun = useRef(false)
  // Use a ref to store the current simulation cancellation function
  const currentSimulation = useRef<{ cancel: () => void } | null>(null)
  // Use a ref for animation frame
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    // Check if Web Workers are supported
    if (typeof Worker === "undefined") {
      setWorkerSupported(false)
      console.warn("Web Workers are not supported in this browser. Falling back to chunked execution.")
    }

    const loadClaims = async () => {
      try {
        const data = await fetchClaims()
        setClaims(data)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch claims:", error)
        setLoading(false)
      }
    }

    loadClaims()

    // Clean up any running simulation when component unmounts
    return () => {
      if (currentSimulation.current) {
        currentSimulation.current.cancel()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Run initial simulation when claims are loaded
  useEffect(() => {
    if (claims.length > 0 && !initialSimulationRun.current) {
      initialSimulationRun.current = true
      runSimulation()
    }
  }, [claims])

  // Debounce probability changes to avoid too many simulations
  useEffect(() => {
    if (initialSimulationRun.current) {
      const timer = setTimeout(() => {
        runSimulation()
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [probabilities])

  // Smooth progress animation
  useEffect(() => {
    if (isSimulating) {
      const animateProgress = () => {
        setDisplayProgress((prev) => {
          // Smoothly animate towards the actual progress
          const diff = progress - prev
          // If we're close enough, just set to the target value
          if (Math.abs(diff) < 0.5) return progress
          // Otherwise, move a percentage of the way there
          return prev + diff * 0.1
        })
        animationFrameRef.current = requestAnimationFrame(animateProgress)
      }
      animationFrameRef.current = requestAnimationFrame(animateProgress)

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    } else {
      // When simulation stops, ensure display progress matches actual progress
      setDisplayProgress(progress)
    }
  }, [isSimulating, progress])

  const runSimulation = () => {
    if (claims.length === 0 || isSimulating) return

    // Cancel any running simulation
    if (currentSimulation.current) {
      currentSimulation.current.cancel()
    }

    setIsSimulating(true)
    setProgress(0)
    setDisplayProgress(0)

    // Use Web Worker for simulation
    currentSimulation.current = runMonteCarloSimulationWithWorker(
      claims,
      probabilities,
      2000,
      (progress) => {
        setProgress(progress * 100)
      },
      (result) => {
        setSimulationResult(result)
        setProgress(100)
        // Let the animation finish smoothly before ending simulation state: to make it faster we can reduce the setTimeout time to 300
        setTimeout(() => {
          setIsSimulating(false)
          currentSimulation.current = null
        }, 500)
      },
    )
  }

  const handleProbabilityChange = (status: keyof PaymentProbabilities, value: number[]) => {
    setProbabilities((prev) => ({
      ...prev,
      [status]: value[0] / 100,
    }))
  }

  if (loading) {
    return <div>Loading claims data...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Forecasting</CardTitle>
        <CardDescription>
          Adjust payment probabilities to see how they affect projected revenue outcomes
          {!workerSupported && (
            <span className="block text-amber-500 mt-1">
              Note: Using fallback calculation method. Web Workers not supported in your browser.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {/* Probability sliders and simulation button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pending-probability">Pending Claims Payment Probability</Label>
                <span className="text-sm font-medium">{Math.round(probabilities.Pending * 100)}%</span>
              </div>
              <Slider
                id="pending-probability"
                min={0}
                max={100}
                step={1}
                value={[probabilities.Pending * 100]}
                onValueChange={(value) => handleProbabilityChange("Pending", value)}
                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                disabled={isSimulating}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="approved-probability">Approved Claims Payment Probability</Label>
                <span className="text-sm font-medium">{Math.round(probabilities.Approved * 100)}%</span>
              </div>
              <Slider
                id="approved-probability"
                min={0}
                max={100}
                step={1}
                value={[probabilities.Approved * 100]}
                onValueChange={(value) => handleProbabilityChange("Approved", value)}
                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                disabled={isSimulating}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="denied-probability">Denied Claims Payment Probability</Label>
                <span className="text-sm font-medium">{Math.round(probabilities.Denied * 100)}%</span>
              </div>
              <Slider
                id="denied-probability"
                min={0}
                max={100}
                step={1}
                value={[probabilities.Denied * 100]}
                onValueChange={(value) => handleProbabilityChange("Denied", value)}
                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                disabled={isSimulating}
              />
            </div>

            <Button onClick={runSimulation} disabled={isSimulating || claims.length === 0} className="w-full relative">
              {isSimulating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Simulating...
                </>
              ) : (
                "Run Simulation"
              )}
            </Button>

            {isSimulating && (
              <div className="space-y-2">
                <div className="relative">
                  <Progress
                    value={displayProgress}
                    className={cn(
                      "transition-all duration-300",
                      isSimulating &&
                        "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer",
                    )}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white mix-blend-difference">
                      {Math.round(displayProgress)}%
                    </span>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">Running Monte Carlo simulation</p>
              </div>
            )}

            {simulationResult && (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 md:grid-cols-1">
                <Card className={cn("transition-all duration-500", isSimulating ? "opacity-50" : "opacity-100")}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium">Expected Revenue</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      $
                      {simulationResult.expectedRevenue.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">Average across all simulations</p>
                  </CardContent>
                </Card>

                <Card
                  className={cn("transition-all duration-500 delay-100", isSimulating ? "opacity-50" : "opacity-100")}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium">Minimum Revenue</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      $
                      {simulationResult.minRevenue.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">Worst case scenario</p>
                  </CardContent>
                </Card>

                <Card
                  className={cn("transition-all duration-500 delay-200", isSimulating ? "opacity-50" : "opacity-100")}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium">Maximum Revenue</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      $
                      {simulationResult.maxRevenue.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">Best case scenario</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {simulationResult && (
            <div className={cn("space-y-4 transition-all duration-500", isSimulating ? "opacity-50" : "opacity-100")}>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">Revenue Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <RevenueDistributionChart
                    distribution={simulationResult.distribution}
                    buckets={simulationResult.buckets}
                    percentiles={simulationResult.percentiles}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">Percentile Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">10th Percentile:</span>
                      <span className="font-medium">
                        $
                        {simulationResult.percentiles.p10.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">25th Percentile:</span>
                      <span className="font-medium">
                        $
                        {simulationResult.percentiles.p25.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">50th Percentile (Median):</span>
                      <span className="font-medium">
                        $
                        {simulationResult.percentiles.p50.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">75th Percentile:</span>
                      <span className="font-medium">
                        $
                        {simulationResult.percentiles.p75.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">90th Percentile:</span>
                      <span className="font-medium">
                        $
                        {simulationResult.percentiles.p90.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
