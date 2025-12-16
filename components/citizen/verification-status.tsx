"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertCircle, FileX } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { VerificationStatus as VerificationType, useAuthStore } from "@/lib/store"
import { useState, useEffect } from "react"
import { PrismaClient } from "@/generated/prisma/client" // make sure this points to your generated Prisma client

export function VerificationStatus() {
  const [verifications, setVerifications] = useState<VerificationType[]>([]);
  const [loading, setLoading] = useState(true)
  
  const {user} = useAuthStore();
  const userId = user?.id || "";

  useEffect(() => {

    if (!userId) {
      setLoading(false);
      return;
    } 
    
    async function loadVerifications() {
      try {
        // Fetch all verifications for the current user
        // For demo, you might pass the user ID from your auth system 

        const res = await fetch(`/api/verifications/get?userId=${userId}`);

        const data = await res.json();

        if (res.ok) {
          // Ensure the data matches your store interface
          const formatted: VerificationType[] = ((await PrismaClient.verification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
          })).verifications || []).map((v: any) => ({
            id: v.id,
            userId: v.userId,
            type: v.type,
            status: v.status.toUpperCase() as VerificationType["status"], // "VERIFIED" | "PENDING" | "REJECTED"
            document_hash: v.document_hash || "",
            createdAt: v.createdAt || v.created_at || new Date().toISOString(),
          }));

        setVerifications(formatted)
        } else{
          console.error("Error loading verifications:", (await PrismaClient.verification.findMany({
              where: { userId },
              orderBy: { createdAt: "desc" },
            })).error)
        }
      } catch (error) {
        console.error("[Prisma] Error loading verifications:", error)
      } finally {
        setLoading(false)
      }
    }

    loadVerifications()
  }, [userId])

  const getIcon = (status: string) => {
    switch (status) {
      case "verified":
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
                <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
