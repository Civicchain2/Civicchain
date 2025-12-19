"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileX } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store"

export function VerificationQueue() {
  const [verifications, setVerifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    loadVerifications()
  }, [])

  const loadVerifications = async () => {
    try {
      const response = await fetch("/api/verifications/pending")
      if (!response.ok) throw new Error("Failed to load verifications")

      const data = await response.json()
      setVerifications(data || [])
    } catch (error) {
      console.error("[v0] Failed to load verifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (verification: any) => {
    if (!user?.did) {
      alert("Your account doesn't have a DID. Please contact administrator.")
      return
    }

    if (!verification.user?.did) {
      alert("User doesn't have a DID. Cannot issue credential.")
      return
    }

    try {
      console.log("[v0] Approving verification and issuing credential")

      const approveResponse = await fetch(`/api/verifications/${verification.id}/approve`, {
        method: "POST",
      })

      if (!approveResponse.ok) throw new Error("Failed to approve verification")

      // Issue verifiable credential
      const credentialResponse = await fetch("/api/identus/credential/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issuerDID: user.did,
          subjectDID: verification.user.did,
          credentialType: "VerifiedIdentity",
          claims: {
            verificationType: verification.documentType,
            verifiedAt: new Date().toISOString(),
            verifiedBy: user.email,
            documentNumber: verification.documentNumber || "N/A",
          },
        }),
      })

      if (!credentialResponse.ok) {
        console.warn("[v0] Failed to issue credential")
      } else {
        const credentialData = await credentialResponse.json()
        console.log("[v0] Credential issued successfully:", credentialData)
      }

      // Reload verifications
      loadVerifications()
    } catch (error) {
      console.error("[v0] Approval error:", error)
      alert("Failed to approve verification")
    }
  }

  const handleReject = async (verificationId: string) => {
    try {
      const response = await fetch(`/api/verifications/${verificationId}/reject`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to reject verification")
      loadVerifications()
    } catch (error) {
      console.error("[v0] Rejection error:", error)
      alert("Failed to reject verification")
    }
  }

  if (loading) {
    return (
      <Card className="p-6 border border-border/40">
        <h2 className="text-lg font-semibold mb-4">Verification Queue</h2>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border border-border/40">
      <h2 className="text-lg font-semibold mb-4">Verification Queue</h2>
      {verifications.length === 0 ? (
        <div className="text-center py-12">
          <FileX className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">There's nothing here yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Pending verifications will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/40">
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verifications.map((verification) => (
                <TableRow key={verification.id} className="border-b border-border/40">
                  <TableCell className="text-sm">
                    {verification.user?.fullName || "Unknown"}
                    <br />
                    <span className="text-xs text-muted-foreground">{verification.user?.email}</span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {typeLabels[verification.documentType?.toLowerCase()] || verification.documentType}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(verification.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
                      Pending
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleApprove(verification)}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive bg-transparent"
                        onClick={() => handleReject(verification.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  )
}

const typeLabels: Record<string, string> = {
  identity: "Identity",
  address: "Address",
  tax: "Tax Certificate",
  education: "Education",
  employment: "Employment",
}
