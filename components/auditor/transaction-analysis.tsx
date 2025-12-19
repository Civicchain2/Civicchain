"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileX } from "lucide-react"

export function TransactionAnalysis() {
  const analysis = [
    {
      metric: "Total Volume (Today)",
      value: "₦ 234,500",
      status: "stable",
    },
    {
      metric: "Average Transaction",
      value: "₦ 4,250",
      status: "stable",
    },
    {
      metric: "Approval Rate",
      value: "96.5%",
      status: "up",
    },
    {
      metric: "Processing Time (Avg)",
      value: "2.3 min",
      status: "down",
    },
  ]

  return (
    <Card className="p-6 border border-border/40">
      <h2 className="text-lg font-semibold mb-4">Transaction Analysis</h2>
      {analysis.length === 0 ? (
        <div className="text-center py-12">
          <FileX className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">There's nothing here yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Transaction analysis will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {analysis.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/40"
            >
              <div>
                <p className="text-sm text-muted-foreground">{item.metric}</p>
                <p className="font-semibold">{item.value}</p>
              </div>
              <Badge
                variant="outline"
                className={
                  item.status === "up"
                    ? "bg-green-500/10 text-green-700 border-green-200"
                    : item.status === "down"
                      ? "bg-red-500/10 text-red-700 border-red-200"
                      : "bg-gray-500/10 text-gray-700 border-gray-200"
                }
              >
                {item.status === "up" ? "↑" : item.status === "down" ? "↓" : "→"} {item.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
