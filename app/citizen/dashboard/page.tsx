"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CitizenHeader } from "@/components/citizen/citizen-header"
import { PaymentCard } from "@/components/citizen/payment-card"
import { VerificationStatus } from "@/components/citizen/verification-status"
import { TransactionHistory } from "@/components/citizen/transaction-history"
import { QuickActions } from "@/components/citizen/quick-actions"
import { DidOverview } from "@/components/citizen/did-overview"
import { useAuthStore } from "@/lib/store"

export default function CitizenDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.querySelector("nav")?.classList.add("hidden")
    document.querySelector("footer")?.classList.add("hidden")

    const userStr = localStorage.getItem("civicchain_user")
    if (!userStr) {
      router.push("/login")
      return
    }
    const userData = JSON.parse(userStr)
    if (userData.role !== "citizen") {
      router.push("/login")
      return
    }
    setUser(userData)
    setLoading(false)

    return () => {
      document.querySelector("nav")?.classList.remove("hidden")
      document.querySelector("footer")?.classList.remove("hidden")
    }
  }, [router])

  if (loading) {
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
      <CitizenHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Section: Quick Actions and Payment Card */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <QuickActions />
          </div>
          <div>
            <PaymentCard />
          </div>
        </div>

        {/* DID Overview Section */}
        <div className="mb-8">
          <DidOverview />
        </div>

        {/* Middle Section: Verification Status */}
        <div className="mb-8">
          <VerificationStatus />
        </div>

        {/* Bottom Section: Transaction History */}
        <div>
          <TransactionHistory />
        </div>
      </main>
    </div>
  )
}
