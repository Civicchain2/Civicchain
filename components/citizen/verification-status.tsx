"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertCircle, FileX } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useDataStore, useAuthStore } from "@/lib/store"
import { useState, useEffect } from "react"

export function VerificationStatus() {
  const { verifications, setVerifications } = useDataStore()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVerifications() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        console.log("[v0] Fetching verifications for user:", user.id)
        const response = await fetch(`/api/verifications/get?userId=${user.id}`)

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Received verifications:", data.verifications)
          setVerifications(data.verifications || [])
        } else {
          console.error("[v0] Failed to fetch verifications:", response.status)
        }
      } catch (error) {
        console.error("[v0] Error loading verifications:", error)
      } finally {
        setLoading(false)
      }
    }

    loadVerifications()
  }, [user?.id, setVerifications])

  const getIcon = (status: string) => {
    switch (status) {
      case "verified":
      case "approved":
        return CheckCircle2
      case "pending":
        return Clock
      case "rejected":
        return AlertCircle
      default:
        return Clock
    }
  }

  const statusColors = {
    verified: "bg-accent/20 text-accent border-accent",
    approved: "bg-accent/20 text-accent border-accent",
    pending: "bg-primary/20 text-primary border-primary",
    rejected: "bg-destructive/20 text-destructive border-destructive",
  }

  if (loading) {
    return (
      <Card className="p-6 border border-border bg-card">
        <h2 className="text-lg font-semibold mb-4">Verification Status</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border border-border bg-card">
      <h2 className="text-lg font-semibold mb-4">Verification Status</h2>
      {verifications.length === 0 ? (
        <div className="text-center py-12">
          <FileX className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">There's nothing here yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Submit verification documents to get started</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {verifications.map((item) => {
            const IconComponent = getIcon(item.status)

            return (
              <div key={item.id} className="p-4 rounded-lg border border-border bg-card/60">
                <div className="flex items-start justify-between mb-3">
                  <IconComponent className="h-5 w-5 text-accent" />
                  <Badge variant="outline" className={statusColors[item.status as keyof typeof statusColors]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm mb-1">{item.type}</h4>
                <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
