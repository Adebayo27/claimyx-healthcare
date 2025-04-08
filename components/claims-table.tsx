"use client"

import { useState, useEffect } from "react"
import { fetchClaims } from "@/lib/actions"
import type { Claim } from "@/lib/data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

type SortDirection = "asc" | "desc" | null
type SortField = keyof Claim | null

export function ClaimsTable() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [statusFilters, setStatusFilters] = useState<Record<string, boolean>>({
    Pending: true,
    Approved: true,
    Denied: true,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadClaims = async () => {
      try {
        const data = await fetchClaims()
        setClaims(data)
        setFilteredClaims(data)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch claims:", error)
        setLoading(false)
      }
    }

    loadClaims()
  }, [])

  useEffect(() => {
    // Apply filters and sorting
    let result = [...claims]

    // Apply status filters
    result = result.filter((claim) => statusFilters[claim.payment_status])
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (claim) =>
          claim.patient_name.toLowerCase().includes(query) ||
          claim.patient_id.toLowerCase().includes(query) ||
          claim.billing_code.toLowerCase().includes(query) ||
          claim.insurance_provider.toLowerCase().includes(query) ||
          claim.payment_status.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        return 0
      })
    }

    setFilteredClaims(result)
  }, [claims, searchQuery, sortField, sortDirection, statusFilters])

  const handleSort = (field: keyof Claim) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortField(null)
        setSortDirection(null)
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: keyof Claim) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="ml-2 h-4 w-4" />
    }
    return sortDirection === "asc" ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
            Pending
          </Badge>
        )
      case "Approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Approved
          </Badge>
        )
      case "Denied":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Denied
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return <div>Loading claims data...</div>
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col space-y-4">
          {/* Search and filter section - stacks on mobile */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search claims..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={statusFilters.Pending}
                  onCheckedChange={(checked: boolean) => setStatusFilters((prev) => ({ ...prev, Pending: checked }))}
                >
                  Pending
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilters.Approved}
                  onCheckedChange={(checked: boolean) => setStatusFilters((prev) => ({ ...prev, Approved: checked }))}
                >
                  Approved
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilters.Denied}
                  onCheckedChange={(checked: boolean) => setStatusFilters((prev) => ({ ...prev, Denied: checked }))}
                >
                  Denied
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Horizontal scrollable container for the table */}
          <div className="overflow-x-auto rounded-md border">
            <div className="w-[85vw] md:w-full min-w-full inline-block align-middle">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] cursor-pointer whitespace-nowrap" onClick={() => handleSort("patient_id")}>
                      <div className="flex items-center">ID {getSortIcon("patient_id")}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("patient_name")}>
                      <div className="flex items-center">Patient {getSortIcon("patient_name")}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("billing_code")}>
                      <div className="flex items-center">Code {getSortIcon("billing_code")}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-right whitespace-nowrap" onClick={() => handleSort("amount")}>
                      <div className="flex items-center justify-end">Amount {getSortIcon("amount")}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("insurance_provider")}>
                      <div className="flex items-center">Provider {getSortIcon("insurance_provider")}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("payment_status")}>
                      <div className="flex items-center">Status {getSortIcon("payment_status")}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("claim_date")}>
                      <div className="flex items-center">Date {getSortIcon("claim_date")}</div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No results found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClaims.map((claim) => (
                      <TableRow key={claim.patient_id + claim.billing_code}>
                        <TableCell className="font-medium whitespace-nowrap">{claim.patient_id}</TableCell>
                        <TableCell>{claim.patient_name}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.billing_code}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          ${claim.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>{claim.insurance_provider}</TableCell>
                        <TableCell className="whitespace-nowrap">{getStatusBadge(claim.payment_status)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(claim.claim_date).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredClaims.length} of {claims.length} claims
          </div>

          {/* Mobile scroll hint - only visible on small screens */}
          <div className="block sm:hidden text-xs text-center text-muted-foreground">
            Swipe horizontally to view all columns
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
