"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { OfficerHeader } from "@/components/officer/officer-header"
import { PendingRequests } from "@/components/officer/pending-requests"
import { VerificationQueue } from "@/components/officer/verification-queue"
import { DailyStats } from "@/components/officer/daily-stats"
import { PaymentApprovals } from "@/components/officer/payment-approvals"
import { useAuthStore } from "@/lib/store"

export default function OfficerDashboard() {
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

    if (user.role !== "officer") {
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
      <OfficerHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <DailyStats />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <PendingRequests />
          </div>
          <div>
            <PaymentApprovals />
          </div>
        </div>

        <div className="mt-8">
          <VerificationQueue />
        </div>
      </main>
    </div>
  )
}
