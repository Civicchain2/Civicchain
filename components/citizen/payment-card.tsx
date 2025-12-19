"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wallet, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { useDataStore } from "@/lib/store"

export function PaymentCard() {
  const [balance, setBalance] = useState<number>(0)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({ inflow: 0, outflow: 0 })
  const { transactions } = useDataStore()

  const loadBalance = () => {
    let inflow = 0
    let outflow = 0

    const totalBalance = transactions.reduce((acc, tx) => {
      const amount = Number(tx.amount) || 0
      if (tx.type === "refund") {
        inflow += amount
        return acc + amount
      } else {
        outflow += amount
        return acc - amount
      }
    }, 50000) // Starting balance

    setBalance(totalBalance)
    setStats({ inflow, outflow })
    setLastUpdated(new Date().toLocaleTimeString())
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    loadBalance()
  }, [transactions])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(loadBalance, 500)
  }

  if (loading) {
    return (
      <Card className="p-6 border border-border/40 bg-card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-8 bg-muted rounded w-3/4"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border border-border/40 bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-accent" />
          <p className="text-sm text-muted-foreground">Account Balance</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <h3 className="text-3xl font-bold mb-4">₦ {balance.toLocaleString()}</h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-xs text-muted-foreground">Inflow</p>
            <p className="text-sm font-semibold text-green-600">+₦{stats.inflow.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg">
          <TrendingDown className="h-4 w-4 text-red-600" />
          <div>
            <p className="text-xs text-muted-foreground">Outflow</p>
            <p className="text-sm font-semibold text-red-600">-₦{stats.outflow.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Status</span>
          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
            Active
          </Badge>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Last Updated</span>
          <span>{lastUpdated}</span>
        </div>
      </div>
    </Card>
  )
}
