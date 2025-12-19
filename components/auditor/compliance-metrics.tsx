"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, TrendingUp, BarChart3 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"

export function ComplianceMetrics() {
  const [loading, setLoading] = useState(true)
  const metrics = [
    {
      label: "Compliance Score",
      value: "0%",
      change: "0%",
      icon: CheckCircle2,
      color: "text-primary",
    },
    {
      label: "Audited Transactions",
      value: "0",
      change: "0",
      icon: BarChart3,
      color: "text-primary",
    },
    {
      label: "Flagged Issues",
      value: "0",
      change: "0",
      icon: AlertCircle,
      color: "text-primary",
    },
    {
      label: "System Integrity",
      value: "0%",
      change: "0%",
      icon: TrendingUp,
      color: "text-primary",
    },
  ]

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 border border-border bg-card">
            <Skeleton className="h-16 w-full" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, i) => {
        const Icon = metric.icon
        return (
          <Card key={i} className="p-4 border border-border bg-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">{metric.label}</p>
                <h3 className="text-xl sm:text-2xl font-bold">{metric.value}</h3>
                <p className="text-xs text-primary mt-1">{metric.change}</p>
              </div>
              <Icon className={`h-5 w-5 ${metric.color}`} />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
