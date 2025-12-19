"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Plus, Check, AlertCircle, Eye, RefreshCw } from "lucide-react"

interface VerifiableCredential {
  id: string
  type: string
  claims: Record<string, any>
  issuer: string
  issuanceDate?: string
  expirationDate?: string
}

interface DidIdentity {
  didUri: string
  credentials: VerifiableCredential[]
  count: number
}

export default function DidPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [identity, setIdentity] = useState<DidIdentity | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCredentials = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/identus/credentials/list?userId=${user.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch credentials")
      }

      const data = await response.json()
      setIdentity(data)
    } catch (error) {
      console.error("[v0] Failed to fetch credentials:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user || user.role !== "citizen") {
      router.push("/login")
      return
    }

    fetchCredentials()
  }, [user, router])

  if (!user) {
    return null
  }

  const getCredentialIcon = (type: string) => {
    if (type.toLowerCase().includes("identity")) return "🆔"
    if (type.toLowerCase().includes("education")) return "🎓"
    if (type.toLowerCase().includes("employment")) return "💼"
    if (type.toLowerCase().includes("address")) return "🏠"
    if (type.toLowerCase().includes("tax")) return "📊"
    return "📄"
  }

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        .navbar, .footer { display: none; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent/10 p-3">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Digital Identity Management</h1>
                <p className="text-muted-foreground">Manage your verifiable credentials on Cardano blockchain</p>
              </div>
            </div>
            <Button onClick={fetchCredentials} variant="outline" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card className="border-border/40 bg-card">
            <CardContent className="pt-6 text-center">
              <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-3 animate-spin" />
              <p className="text-muted-foreground">Loading your digital identity...</p>
            </CardContent>
          </Card>
        ) : identity ? (
          <>
            {/* Identity Overview */}
            <Card className="border-border/40 bg-card mb-8">
              <CardHeader>
                <CardTitle className="text-foreground">Your DID Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg bg-background/50 border border-border/20">
                    <div className="text-sm text-muted-foreground mb-2">DID URI</div>
                    <div className="text-sm font-mono text-accent break-all">{identity.didUri}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50 border border-border/20">
                    <div className="text-sm text-muted-foreground mb-2">Total Credentials</div>
                    <div className="text-2xl font-bold text-accent">{identity.count}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Credentials List */}
            <div className="space-y-4 mb-8">
              {identity.credentials.length > 0 ? (
                identity.credentials.map((credential) => (
                  <Card key={credential.id} className="border-border/40 bg-card hover:bg-card/80 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="text-3xl">{getCredentialIcon(credential.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">{credential.type}</h3>
                              <Badge className="bg-accent/20 text-accent">
                                <Check className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">Issuer: {credential.issuer}</p>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              {credential.issuanceDate && (
                                <div>
                                  <span className="text-muted-foreground">Issued: </span>
                                  <span className="text-foreground">
                                    {new Date(credential.issuanceDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {credential.expirationDate && (
                                <div>
                                  <span className="text-muted-foreground">Expires: </span>
                                  <span className="text-foreground">
                                    {new Date(credential.expirationDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                            {Object.keys(credential.claims).length > 0 && (
                              <div className="mt-3 p-3 bg-background/50 rounded border border-border/20">
                                <div className="text-xs text-muted-foreground mb-1">Claims:</div>
                                <pre className="text-xs text-foreground overflow-x-auto">
                                  {JSON.stringify(credential.claims, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border/40 hover:bg-background/50 bg-transparent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-border/40 bg-card">
                  <CardContent className="pt-6 text-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No credentials yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Request verification from authorized issuers to add credentials
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Add Credential */}
            <Card className="border-border/40 bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Add New Credential</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Request verification from authorized issuers to add new credentials to your digital identity.
                </p>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Request Credential
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-border/40 bg-card">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
              <p className="text-muted-foreground">Failed to load digital identity</p>
              <Button onClick={fetchCredentials} className="mt-4 bg-transparent" variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
