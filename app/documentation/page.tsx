import { DashboardHeader } from "@/components/dashboard-header";

export default function DocumentationPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="container mx-auto py-8 px-4">
      
      <h1 className="text-3xl font-bold mb-6">Claimyx Healthcare Billing Dashboard Documentation</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Component Architecture</h2>
        <p className="mb-4">
          The Healthcare Billing Dashboard is built using a modular component architecture that follows React best
          practices and leverages the power of Next.js 14 App Router.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-2">Key Components</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Dashboard Page (app/page.tsx)</strong>: The main entry point that composes all dashboard components
            and implements Suspense boundaries for improved loading states.
          </li>
          <li>
            <strong>DashboardSummary</strong>: A server component that fetches and displays key metrics and
            visualizations.
          </li>
          <li>
            <strong>ClaimsTable</strong>: A client component that implements filtering, sorting, and searching
            functionality for claims data.
          </li>
          <li>
            <strong>RevenueForecasting</strong>: A client component that implements the Monte Carlo simulation for
            revenue forecasting with interactive sliders.
          </li>
          <li>
            <strong>Charts</strong>: Client components that render visualizations using the Canvas API for optimal
            performance.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data Flow and State Management</h2>
        <p className="mb-4">
          The application uses a combination of server-side and client-side state management strategies:
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Server Actions</strong>: Used for data fetching operations in <code>lib/actions.ts</code>. These
            functions are called from both server and client components to retrieve claims data and summary statistics.
          </li>
          <li>
            <strong>React State</strong>: Local component state is used for UI interactions like filtering, sorting, and
            simulation parameters.
          </li>
          <li>
            <strong>React Refs</strong>: Used for canvas rendering and tracking initialization state.
          </li>
          <li>
            <strong>React Effects</strong>: Used for side effects like running simulations when parameters change.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Monte Carlo Simulation Implementation</h2>

        <p className="mb-4">
          The Monte Carlo simulation is implemented with performance and UI responsiveness as key considerations:
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Chunked Processing</strong>: The simulation runs in small chunks using{" "}
            <code>requestAnimationFrame</code> to prevent UI blocking, even during intensive calculations.
          </li>
          <li>
            <strong>Progress Tracking</strong>: A progress indicator shows the simulation status to provide feedback
            during longer calculations.
          </li>
          <li>
            <strong>Probability Controls</strong>: Interactive sliders allow users to adjust payment probabilities for
            different claim statuses.
          </li>
          <li>
            <strong>Statistical Analysis</strong>: The simulation calculates expected revenue, min/max values, and
            percentiles (10th, 25th, 50th, 75th, 90th) to provide a comprehensive view of possible outcomes.
          </li>
          <li>
            <strong>Visualization</strong>: A histogram shows the distribution of simulation results with markers for
            key percentiles.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Performance Optimizations</h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>React Server Components</strong>: Used for static content and initial data fetching to reduce
            client-side JavaScript.
          </li>
          <li>
            <strong>Suspense Boundaries</strong>: Implemented for better loading states and progressive rendering.
          </li>
          <li>
            <strong>Debounced Updates</strong>: Slider changes trigger simulations after a short delay to prevent
            excessive recalculations.
          </li>
          <li>
            <strong>Canvas Rendering</strong>: Charts use the Canvas API instead of SVG for better performance with
            large datasets.
          </li>
          <li>
            <strong>Chunked Calculations</strong>: Monte Carlo simulations run in small batches to maintain UI
            responsiveness.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Future Enhancements</h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Web Workers</strong>: Move simulation calculations to a separate thread for even better UI
            responsiveness.
          </li>
          <li>
            <strong>More Advanced Simulations</strong>: Add support for more complex probability distributions and
            parameters.
          </li>
          <li>
            <strong>Data Export</strong>: Allow users to export simulation results and claim data.
          </li>
          <li>
            <strong>Real-time Updates</strong>: Implement WebSockets for real-time claim updates.
          </li>
          <li>
            <strong>Advanced Filtering</strong>: Add date range filters and more complex search capabilities.
          </li>
        </ul>
      </section>
    </div>
    </div>
    
  )
}
