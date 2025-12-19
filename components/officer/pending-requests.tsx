"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileX } from "lucide-react"

export function PendingRequests() {
  const requests: any[] = []

  return (
    <Card className="p-6 border border-border/40">
      <h2 className="text-lg font-semibold mb-4">Pending Requests</h2>
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <FileX className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">There's nothing here yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Pending requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-lg border border-border/40 bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-sm">{req.citizenName}</h4>
                  <p className="text-xs text-muted-foreground">{req.requestType}</p>
                </div>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-200">
                  Pending
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Submitted: {req.submittedDate}</p>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
