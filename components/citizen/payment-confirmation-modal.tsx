"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QRCodeGenerator } from "./qr-code-generator"
import { CheckCircle, Copy, Download } from "lucide-react"
import { toast } from "sonner"

interface PaymentConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: {
    id: number
    description: string
    amount: string
    status: string
    txHash: string
    recipientEmail?: string
  }
}

export function PaymentConfirmationModal({ open, onOpenChange, transaction }: PaymentConfirmationModalProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadReceipt = () => {
    const receiptText = `
CIVICCHAIN PAYMENT RECEIPT
==========================
Transaction ID: ${transaction.id}
Hash: ${transaction.txHash}
Amount: ${transaction.amount}
Description: ${transaction.description}
Status: ${transaction.status.toUpperCase()}
Date: ${new Date().toLocaleString()}
Recipient: ${transaction.recipientEmail}

This is a blockchain-verified transaction on Cardano.
    `.trim()

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(receiptText))
    element.setAttribute("download", `payment-receipt-${transaction.id}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success("Receipt downloaded!")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Payment Successful
          </DialogTitle>
          <DialogDescription>Your transaction has been processed and recorded on the blockchain.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4 border border-border/40 bg-card/50">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-bold text-lg text-accent">{transaction.amount}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Description</span>
                <span className="text-sm font-medium text-right max-w-xs">{transaction.description}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </Badge>
              </div>
              <div className="pt-2 border-t border-border/40">
                <span className="text-xs text-muted-foreground block mb-1">Transaction Hash</span>
                <div className="flex items-center gap-2 bg-background p-2 rounded border border-border/40">
                  <code className="text-xs font-mono flex-1 truncate text-foreground">{transaction.txHash}</code>
                  <button
                    onClick={() => copyToClipboard(transaction.txHash)}
                    className="p-1 hover:bg-card rounded transition-colors"
                    title="Copy hash"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-accent" />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-border/40 bg-card/50 flex flex-col items-center">
            <span className="text-sm text-muted-foreground mb-3">Scan for Transaction Details</span>
            <QRCodeGenerator value={transaction.txHash} size={180} />
          </Card>

          <Card className="p-4 border border-border/40 bg-card/50">
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium">Recipient:</span> {transaction.recipientEmail}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Transaction ID:</span> {transaction.id}
              </p>
              <p className="text-xs text-muted-foreground">
                This transaction is immutable and recorded on the Cardano blockchain.
              </p>
            </div>
          </Card>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={downloadReceipt} className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Download Receipt
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
