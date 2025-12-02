"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import type { SaleHistory } from "@/lib/user-dashboard"

interface SalesHistoryProps {
  salesHistory: SaleHistory[]
}

export function SalesHistory({ salesHistory }: SalesHistoryProps) {
  const recentSales = salesHistory.slice(-10).reverse()

  if (recentSales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
          <CardDescription>Your recent transactions and sales</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No transactions yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales History</CardTitle>
        <CardDescription>Your recent transactions and sales</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipe</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">{sale.recipeName}</TableCell>
                <TableCell>
                  <Badge variant={sale.type === "sale" ? "default" : "outline"}>
                    {sale.type === "sale" ? "Sold" : "Purchased"}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {sale.buyerAddress.slice(0, 6)}...{sale.buyerAddress.slice(-4)}
                </TableCell>
                <TableCell className="font-semibold">{sale.price} ETH</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(sale.timestamp), "MMM dd, yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
