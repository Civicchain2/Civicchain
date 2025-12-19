"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, FileX } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useDataStore } from "@/lib/store"

export function TransactionHistory() {
  const { transactions } = useDataStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <Card className="p-6 border border-border/40">
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border border-border/40">
      <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <FileX className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">There's nothing here yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Your transactions will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/40">
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tx Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="border-b border-border/40">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tx.type === "payment" ? (
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-sm capitalize">{tx.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{tx.description}</TableCell>
                  <TableCell className="font-medium">₦ {Number(tx.amount).toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        tx.status === "completed"
                          ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                          : tx.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                            : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                      }
                    >
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-accent font-mono">{tx.txHash}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  )
}
