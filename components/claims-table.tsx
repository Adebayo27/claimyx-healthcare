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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const loadClaims = async () => {
      try {
        const data = await fetchClaims()
        setClaims(data)
        setFilteredClaims(data)
        setTotalPages(Math.ceil(data.length / itemsPerPage))
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch claims:", error)
        setLoading(false)
      }
    }

    loadClaims()
  }, [itemsPerPage])

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
    setTotalPages(Math.ceil(result.length / itemsPerPage))

    // Reset to first page when filters change
    setCurrentPage(1)
  }, [claims, searchQuery, sortField, sortDirection, statusFilters, itemsPerPage])

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

  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredClaims.slice(indexOfFirstItem, indexOfLastItem)

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always show first page
      pageNumbers.push(1)

      // Calculate start and end of middle pages
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        endPage = 4
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push("ellipsis1")
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("ellipsis2")
      }

      // Always show last page
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  if (loading) {
    return <div>Loading claims data...</div>
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search claims..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort("patient_id")}>
                    <div className="flex items-center">ID {getSortIcon("patient_id")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("patient_name")}>
                    <div className="flex items-center">Patient {getSortIcon("patient_name")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("billing_code")}>
                    <div className="flex items-center">Code {getSortIcon("billing_code")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("amount")}>
                    <div className="flex items-center justify-end">Amount {getSortIcon("amount")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("insurance_provider")}>
                    <div className="flex items-center">Provider {getSortIcon("insurance_provider")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("payment_status")}>
                    <div className="flex items-center">Status {getSortIcon("payment_status")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("claim_date")}>
                    <div className="flex items-center">Date {getSortIcon("claim_date")}</div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((claim) => (
                    <TableRow key={claim.patient_id + claim.billing_code}>
                      <TableCell className="font-medium">{claim.patient_id}</TableCell>
                      <TableCell>{claim.patient_name}</TableCell>
                      <TableCell>{claim.billing_code}</TableCell>
                      <TableCell className="text-right">
                        ${claim.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{claim.insurance_provider}</TableCell>
                      <TableCell>{getStatusBadge(claim.payment_status)}</TableCell>
                      <TableCell>{new Date(claim.claim_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <div className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredClaims.length)} of{" "}
              {filteredClaims.length} claims
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Rows per page</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value: string) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={itemsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === "ellipsis1" || page === "ellipsis2" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink isActive={currentPage === page} onClick={() => paginate(page as number)}>
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
