export type Claim = {
  patient_id: string
  patient_name: string
  billing_code: string
  amount: number
  insurance_provider: string
  payment_status: "Pending" | "Approved" | "Denied"
  claim_date: string
}

export const mockClaims: Claim[] = [
  {
    patient_id: "P1",
    patient_name: "John Smith",
    billing_code: "B1001",
    amount: 1675.5,
    insurance_provider: "Blue Shield",
    payment_status: "Pending",
    claim_date: "2025-03-25",
  },
  {
    patient_id: "P2",
    patient_name: "Sarah Johnson",
    billing_code: "B2002",
    amount: 2310.09,
    insurance_provider: "Medicare",
    payment_status: "Approved",
    claim_date: "2025-01-05",
  },
  {
    patient_id: "P3",
    patient_name: "Robert Chen",
    billing_code: "B3003",
    amount: 4945.57,
    insurance_provider: "Aetna",
    payment_status: "Pending",
    claim_date: "2025-03-04",
  },
  {
    patient_id: "P4",
    patient_name: "Lisa Williams",
    billing_code: "B4004",
    amount: 8338.89,
    insurance_provider: "UnitedHealth",
    payment_status: "Denied",
    claim_date: "2025-03-20",
  },
  {
    patient_id: "P5",
    patient_name: "Michael Garcia",
    billing_code: "B5005",
    amount: 3220.05,
    insurance_provider: "Cigna",
    payment_status: "Denied",
    claim_date: "2025-02-21",
  },
]

// Add more mock data for a more realistic dataset
export const extendedMockClaims: Claim[] = [
  ...mockClaims,
  {
    patient_id: "P6",
    patient_name: "Emily Rodriguez",
    billing_code: "B6006",
    amount: 1250.75,
    insurance_provider: "Blue Shield",
    payment_status: "Approved",
    claim_date: "2025-03-15",
  },
  {
    patient_id: "P7",
    patient_name: "David Kim",
    billing_code: "B7007",
    amount: 3750.25,
    insurance_provider: "Medicare",
    payment_status: "Pending",
    claim_date: "2025-02-28",
  },
  {
    patient_id: "P8",
    patient_name: "Jennifer Lee",
    billing_code: "B8008",
    amount: 5125.5,
    insurance_provider: "Aetna",
    payment_status: "Approved",
    claim_date: "2025-01-22",
  },
  {
    patient_id: "P9",
    patient_name: "Thomas Brown",
    billing_code: "B9009",
    amount: 2875.3,
    insurance_provider: "UnitedHealth",
    payment_status: "Denied",
    claim_date: "2025-03-10",
  },
  {
    patient_id: "P10",
    patient_name: "Maria Martinez",
    billing_code: "B1010",
    amount: 4225.8,
    insurance_provider: "Cigna",
    payment_status: "Pending",
    claim_date: "2025-02-15",
  },
  {
    patient_id: "P11",
    patient_name: "James Wilson",
    billing_code: "B1011",
    amount: 1875.45,
    insurance_provider: "Blue Shield",
    payment_status: "Approved",
    claim_date: "2025-01-30",
  },
  {
    patient_id: "P12",
    patient_name: "Patricia Taylor",
    billing_code: "B1012",
    amount: 6350.2,
    insurance_provider: "Medicare",
    payment_status: "Denied",
    claim_date: "2025-03-05",
  },
]
