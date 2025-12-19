"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, FileCheck, FileX, Shield } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function CredentialsCard() {
  const [credentials, setCredentials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCredentials()
  }, [])

  const loadCredentials = async () => {
    try {
      const response = await fetch("/api/credentials")

      if (!response.ok) throw new Error("Failed to load credentials")

      const data = await response.json()
      setCredentials(data.credentials || [])
    } catch (error) {
      console.error("[v0] Failed to load credentials:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6 border border-border/40">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="h-5 w-5" />
          My Credentials
        </h2>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border border-border/40">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Award className="h-5 w-5" />
        My Credentials
      </h2>

      {credentials.length === 0 ? (
        <div className="text-center py-12">
          <FileX className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No credentials yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Your verified credentials will appear here once approved
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {credentials.map((credential) => (
            <Card key={credential.id} className="p-4 border border-border/40 bg-muted/30">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{credential.type}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Issued: {new Date(credential.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
                  <FileCheck className="h-3 w-3 mr-1" />
                  {credential.status === "active" ? "Verified" : credential.status}
                </Badge>
              </div>
              <div className="mt-3 pt-3 border-t border-border/40">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  )
}
