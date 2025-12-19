"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, AlertCircle, Info, FileX } from "lucide-react"

export function RiskAssessment() {
  const risks = [
    {
      id: 1,
      category: "High Value Transactions",
      level: "high",
      count: 5,
      icon: AlertTriangle,
      description: "Transactions exceeding ₦50,000",
    },
    {
      id: 2,
      category: "Unusual Patterns",
      level: "medium",
      count: 12,
      icon: AlertCircle,
      description: "Deviation from normal behavior",
    },
    {
      id: 3,
      category: "Verification Failures",
      level: "low",
      count: 2,
      icon: Info,
      description: "Failed identity verifications",
    },
  ]

  const riskColors = {
    high: "bg-red-500/10 text-red-700 border-red-200",
    medium: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
    low: "bg-blue-500/10 text-blue-700 border-blue-200",
  }

  return (
    <Card className="p-6 border border-border/40">
      <h2 className="text-lg font-semibold mb-4">Risk Assessment</h2>
      {risks.length === 0 ? (
        <div className="text-center py-12">
          <FileX className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">There's nothing here yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Risk assessments will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {risks.map((risk) => {
            const Icon = risk.icon
            return (
              <div key={risk.id} className="p-4 rounded-lg border border-border/40 bg-card/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <Icon
                      className={`h-5 w-5 mt-0.5 ${risk.level === "high" ? "text-red-500" : risk.level === "medium" ? "text-yellow-500" : "text-blue-500"}`}
                    />
                    <div>
                      <h4 className="font-medium text-sm">{risk.category}</h4>
                      <p className="text-xs text-muted-foreground">{risk.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{risk.count}</p>
                    <Badge variant="outline" className={riskColors[risk.level as keyof typeof riskColors]}>
                      {risk.level.charAt(0).toUpperCase() + risk.level.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
