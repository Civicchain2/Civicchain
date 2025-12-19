"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileX } from "lucide-react"

export function PaymentApprovals() {
  const payments = [
    {
      id: 1,
      amount: "₦ 5,000",
      citizen: "Chioma Okafor",
      description: "License Renewal",
      date: "2025-11-08",
      status: "pending_approval",
    },
    {
      id: 2,
      amount: "₦ 3,200",
      citizen: "Oluwaseun Adeyemi",
      description: "Utility Payment",
      date: "2025-11-07",
      status: "pending_approval",
    },
    {
      id: 3,
      amount: "₦ 10,000",
      citizen: "Grace Obi",
      description: "Property Tax",
      date: "2025-11-06",
      status: "pending_approval",
    },
  ]

  return (
    <Card className="p-6 border border-border/40">
      <h2 className="text-lg font-semibold mb-4">Payment Approvals</h2>
      {payments.length === 0 ? (
        <div className="text-center py-12">
          <FileX className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">There's nothing here yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Payment approvals will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="p-4 rounded-lg border border-border/40 bg-card/50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-sm">{payment.citizen}</h4>
                  <p className="text-xs text-muted-foreground">{payment.description}</p>
                </div>
                <p className="font-bold text-accent">{payment.amount}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{payment.date}</p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive">
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
