"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"

export function PaymentForm() {
  const [open, setOpen] = useState(false)

  const paymentTypes = [
    { id: "license", label: "License Renewal", amount: "5000" },
    { id: "tax", label: "Property Tax", amount: "10000" },
    { id: "utility", label: "Utility Bill", amount: "3200" },
    { id: "verification", label: "Verification Fee", amount: "2500" },
    { id: "custom", label: "Custom Amount", amount: "" },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Payment logic will be implemented when Cardano wallet is integrated
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-auto flex flex-col items-center justify-center p-4 gap-2 bg-transparent border-border w-full group hover:bg-card/80 transition-colors"
        >
          <Send className="h-5 w-5 text-primary group-hover:text-accent transition-colors" />
          <span className="text-sm font-medium">Make Payment</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogDescription>Connect your Cardano wallet to proceed with the transaction.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="paymentType">Payment Type</Label>
            <Select>
              <SelectTrigger id="paymentType">
                <SelectValue placeholder="Select a payment type" />
              </SelectTrigger>
              <SelectContent>
                {paymentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs">
              Wallet integration required. See documentation for setup instructions.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled>
              Connect Wallet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
