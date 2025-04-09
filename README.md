# Healthcare Billing Dashboard

A comprehensive healthcare billing dashboard with revenue forecasting using Monte Carlo simulation. This dashboard allows healthcare administrators to visualize billing data and adjust payment probability parameters to see how they affect projected revenue outcomes in real-time.

## Features

- **Dashboard Summary**: Overview of total billing amount and claims by status
- **Claims Table**: Filterable and sortable table with search functionality
- **Revenue Forecasting**: Monte Carlo simulation with adjustable payment probabilities
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Simulation results update as parameters change

## Technologies Used

- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui component library
- Recharts for data visualization

## Setup Instructions

### Prerequisites

- Node.js 18.17.0 or later
- npm or yarn package manager
- pnpm because of shadcn/ui

### Installation

1. Clone the repository:

```
git clone https://github.com/Adebayo27/claimyx-healthcare.git
cd claimyx-healthcare
```

2. Install dependencies:

```
npm install
# or
yarn install
```
3. Install the `shadcn/ui` package:

```
npm install -g pnpm // Install pnpm globally
npx shadcn@latest add button card table badge input dropdown-menu slider label progress skeleton tooltip select pagination
```

4. Start the development server:

```
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

<!-- \`\`\`
healthcare-dashboard/
├── app/                    # Next.js App Router
│   ├── documentation/      # Documentation page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Dashboard page
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── claims-table.tsx    # Claims table component
│   ├── dashboard-header.tsx # Dashboard header
│   ├── dashboard-summary.tsx # Summary cards and charts
│   └── revenue-forecasting.tsx # Monte Carlo simulation
├── lib/                    # Utility functions
│   ├── actions.ts          # Server actions
│   ├── data.ts             # Mock data
│   ├── monte-carlo.ts      # Simulation logic
│   └── utils.ts            # Helper functions
├── public/                 # Static assets
├── tailwind.config.ts      # Tailwind configuration
└── components.json         # shadcn/ui configuration
\`\`\` -->

## Usage

### Dashboard Summary

The dashboard summary provides an overview of your billing data, including:
- Total billing amount
- Number of claims by status (Pending, Approved, Denied)
- Distribution of claims by insurance provider

### Claims Table

The claims table allows you to:
- Search for specific claims
- Filter claims by payment status
- Sort claims by clicking on column headers
- View detailed information about each claim

### Revenue Forecasting

The revenue forecasting tool uses Monte Carlo simulation to predict possible revenue outcomes:
1. Adjust the payment probability sliders for each claim status
2. The simulation automatically runs when parameters change
3. View the expected revenue and range of possible outcomes
4. Analyze the distribution chart to understand the probability of different revenue scenarios

## Troubleshooting

### Dependency Issues

If you encounter dependency conflicts with `date-fns`, ensure you're using version 2.x:

```
npm install date-fns@^2.30.0
```

### Package Manager Errors

If you see errors related to `pnpm`, you can either:
1. Install pnpm globally: `npm install -g pnpm`
2. Configure the project to use npm instead by updating the `packageManager` field in `components.json`
