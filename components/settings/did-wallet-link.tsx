/**
 * DID Wallet Link Component
 * Allows authenticated users to link a DIDComm wallet to their account
 * This is an OPTIONAL post-registration feature
 */

"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Wallet,
  QrCode,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  LinkIcon,
  Unlink,
  RefreshCw,
  ExternalLink,
} from "lucide-react"

interface DidLinkStatus {
  linked: boolean
  state: "linked" | "pending" | "not_linked"
  did?: string
  linkedAt?: string
  connectionId?: string
  connectionState?: string
}

export function DidWalletLink() {
  const [status, setStatus] = useState<DidLinkStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [linking, setLinking] = useState(false)
  const [unlinking, setUnlinking] = useState(false)
  const [invitation, setInvitation] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch current DID link status
  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/identus/link/status")
      if (!response.ok) throw new Error("Failed to fetch status")

      const data = await response.json()
      setStatus(data)
    } catch (err) {
      console.error("[v0] Failed to fetch DID link status:", err)
      setError("Failed to load DID wallet status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  // Start the DID linking process
  const handleStartLinking = async () => {
    setLinking(true)
    setError(null)

    try {
      const response = await fetch("/api/identus/link/start", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to start linking")
      }

      const data = await response.json()
      setInvitation(data.invitation)

      // Poll for connection completion
      pollConnectionStatus(data.connectionId)
    } catch (err) {
      console.error("[v0] Failed to start DID linking:", err)
      setError(err instanceof Error ? err.message : "Failed to start linking")
      setLinking(false)
    }
  }

  // Poll connection status and complete when ready
  const pollConnectionStatus = async (connectionId: string) => {
    let attempts = 0
    const maxAttempts = 60 // 5 minutes with 5-second intervals

    const poll = async () => {
      attempts++

      try {
        const response = await fetch("/api/identus/link/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connectionId }),
        })

        if (response.ok) {
          // Link completed successfully
          setInvitation(null)
          setLinking(false)
          await fetchStatus()
          return
        }

        const data = await response.json()

        // If connection not ready yet, continue polling
        if (attempts < maxAttempts && data.error?.includes("not ready")) {
          setTimeout(poll, 5000)
        } else {
          // Max attempts reached or other error
          setError("Linking timed out. Please try again.")
          setLinking(false)
          setInvitation(null)
        }
      } catch (err) {
        console.error("[v0] Polling error:", err)
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000)
        } else {
          setError("Failed to complete linking")
          setLinking(false)
          setInvitation(null)
        }
      }
    }

    // Start polling after 3 seconds
    setTimeout(poll, 3000)
  }

  // Unlink DID wallet
  const handleUnlink = async () => {
    if (!confirm("Are you sure you want to unlink your DID wallet?")) {
      return
    }

    setUnlinking(true)
    setError(null)

    try {
      const response = await fetch("/api/identus/link/unlink", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to unlink")
      }

      await fetchStatus()
    } catch (err) {
      console.error("[v0] Failed to unlink DID:", err)
      setError(err instanceof Error ? err.message : "Failed to unlink")
    } finally {
      setUnlinking(false)
    }
  }

  // Copy invitation to clipboard
  const handleCopy = () => {
    if (invitation) {
      navigator.clipboard.writeText(invitation)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">DID Wallet</h2>
          <p className="text-sm text-muted-foreground mt-1">Link a decentralized identity wallet (optional)</p>
        </div>

        {status?.linked && (
          <Badge variant="outline" className="text-green-600 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Linked
          </Badge>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Not Linked State */}
      {status?.state === "not_linked" && !linking && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <Wallet className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No wallet linked</p>
              <p className="text-sm text-muted-foreground">Connect your DIDComm wallet for enhanced security</p>
            </div>
          </div>
          <Button onClick={handleStartLinking} className="gap-2 w-full sm:w-auto">
            <LinkIcon className="h-4 w-4" />
            Link DID Wallet
          </Button>
        </div>
      )}

      {/* Linking in Progress */}
      {linking && invitation && (
        <div className="space-y-4">
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              <QrCode className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Scan with your wallet</p>
                <p className="text-sm text-muted-foreground">Use a compatible DIDComm wallet to scan this invitation</p>
              </div>
              <RefreshCw className="h-4 w-4 animate-spin text-accent" />
            </div>

            <div className="bg-background p-3 rounded border border-border">
              <code className="text-xs break-all">{invitation}</code>
            </div>

            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 flex-1 bg-transparent">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(invitation, "_blank")} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">Waiting for wallet connection...</p>
        </div>
      )}

      {/* Linked State */}
      {status?.state === "linked" && status.did && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <Wallet className="h-10 w-10 text-accent" />
            <div className="flex-1 min-w-0">
              <p className="font-medium">Wallet Connected</p>
              <code className="text-xs text-muted-foreground font-mono truncate block">{status.did}</code>
              {status.linkedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Linked on {new Date(status.linkedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleUnlink}
            disabled={unlinking}
            className="gap-2 w-full sm:w-auto bg-transparent"
          >
            {unlinking ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Unlinking...
              </>
            ) : (
              <>
                <Unlink className="h-4 w-4" />
                Unlink Wallet
              </>
            )}
          </Button>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Linking a DID wallet is optional and provides an additional trust anchor for credential
          flows. Your account credentials remain the primary authentication method.
        </p>
      </div>
    </Card>
  )
}
