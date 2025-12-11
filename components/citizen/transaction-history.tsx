"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react"
import { useDataStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

export function TransactionHistory() {
  // 1. Use the Global Store (so updates from PaymentForm show up here instantly)
  const { transactions, setTransactions } = useDataStore()
  const [loading, setLoading] = useState(true)

  // 2. Fetch Real History from Database on Load
  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/transactions")
      const data = await res.json()
      
      // Safety check: ensure data is an array
      if (Array.isArray(data)) {
        setTransactions(data)
      }
    } catch (error) {
      console.error("Failed to fetch history:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, []) // Run once on mount

  return (
    <Card className="p-6 border border-border/40">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Transaction History</h2>
        <Button variant="ghost" size="sm" onClick={fetchHistory} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

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
            {transactions.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No transactions found. Make your first payment!
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx: any) => (
                <TableRow key={tx.id || Math.random()} className="border-b border-border/40">
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
                  <TableCell className="font-medium">
                    {/* Handle both raw numbers and formatted strings */}
                    {tx.amount.toString().startsWith("₦") ? tx.amount : `₦ ${Number(tx.amount).toLocaleString()}`}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
                      Completed
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-accent font-mono">
                    {/* Link to Real Cardano Explorer */}
                    {tx.txHash && tx.txHash.startsWith("0x") ? (
                       <span title="Simulated Hash">{tx.txHash.substring(0, 10)}...</span>
                    ) : (
                      <a 
                        href={`https://preprod.cardanoscan.io/transaction/${tx.txHash}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="hover:underline text-blue-400"
                      >
                        {tx.txHash ? `${tx.txHash.substring(0, 10)}...` : "Pending"}
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}