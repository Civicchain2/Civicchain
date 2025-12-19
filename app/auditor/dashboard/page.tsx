"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuditorHeader } from "@/components/auditor/auditor-header"
import { ComplianceMetrics } from "@/components/auditor/compliance-metrics"
import { AuditLogs } from "@/components/auditor/audit-logs"
import { RiskAssessment } from "@/components/auditor/risk-assessment"
import { TransactionAnalysis } from "@/components/auditor/transaction-analysis"
import { useAuthStore } from "@/lib/store"

export default function AuditorDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.querySelector("nav")?.classList.add("hidden")
    document.querySelector("footer")?.classList.add("hidden")

    if (!isAuthenticated() || !user) {
      router.push("/login")
      return
    }

    if (user.role !== "auditor") {
      router.push("/login")
      return
    }

    setLoading(false)

    return () => {
      document.querySelector("nav")?.classList.remove("hidden")
      document.querySelector("footer")?.classList.remove("hidden")
    }
  }, [router, user, isAuthenticated])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AuditorHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <ComplianceMetrics />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <RiskAssessment />
          <TransactionAnalysis />
        </div>

        <div>
          <AuditLogs />
        </div>
      </main>
    </div>
  )
}
