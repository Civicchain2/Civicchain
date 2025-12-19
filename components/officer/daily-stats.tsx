"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"

export function DailyStats() {
  const [loading, setLoading] = useState(true)
  const stats = {
    approvals: 0,
    pending: 0,
    rejected: 0,
    revenue: 0,
  }

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const statItems = [
    {
      label: "Total Approvals",
      value: stats.approvals.toString(),
      icon: CheckCircle2,
      color: "text-primary",
    },
    {
      label: "Pending Reviews",
      value: stats.pending.toString(),
      icon: Clock,
      color: "text-primary",
    },
    {
      label: "Rejected",
      value: stats.rejected.toString(),
      icon: AlertCircle,
      color: "text-primary",
    },
    {
      label: "Total Revenue",
      value: `₦ ${(stats.revenue / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      color: "text-primary",
    },
  ]

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
      {statItems.map((stat, i) => {
        const Icon = stat.icon
        return (
          <Card key={i} className="p-4 border border-border bg-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">{stat.label}</p>
                <h3 className="text-xl sm:text-2xl font-bold">{stat.value}</h3>
              </div>
              <Icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
