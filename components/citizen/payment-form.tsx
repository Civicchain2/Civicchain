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


// "use client"

// import type React from "react"

// import { useState } from "react"
// import * as z from "zod"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogFooter,
// } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Send, AlertCircle } from "lucide-react"
// import { PaymentConfirmationModal } from "./payment-confirmation-modal"
// import { useDataStore } from "@/lib/store"
// import { Label } from "@/components/ui/label"

// const paymentSchema = z.object({
//   paymentType: z.string().min(1, "Please select a payment type"),
//   amount: z
//     .string()
//     .min(1, "Amount is required")
//     .refine((val) => Number.parseFloat(val) > 0, {
//       message: "Amount must be greater than 0",
//     }),
//   description: z.string().min(1, "Description is required").max(100),
//   recipientEmail: z.string().email("Invalid email address"),
// })

// type PaymentFormData = z.infer<typeof paymentSchema>

// export function PaymentForm() {
//   const [open, setOpen] = useState(false)
//   const [showConfirmation, setShowConfirmation] = useState(false)
//   const [transactionData, setTransactionData] = useState<any>(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const [errors, setErrors] = useState<Partial<PaymentFormData>>({})
//   const { addTransaction } = useDataStore()

//   const [formData, setFormData] = useState<PaymentFormData>({
//     paymentType: "",
//     amount: "",
//     description: "",
//     recipientEmail: "",
//   })

//   const paymentTypes = [
//     { id: "license", label: "License Renewal", amount: "₦ 5,000" },
//     { id: "tax", label: "Property Tax", amount: "₦ 10,000" },
//     { id: "utility", label: "Utility Bill", amount: "₦ 3,200" },
//     { id: "verification", label: "Verification Fee", amount: "₦ 2,500" },
//     { id: "custom", label: "Custom Amount", amount: "Custom" },
//   ]

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault()
//     setErrors({})

//     try {
//       const validatedData = paymentSchema.parse(formData)
//       setIsLoading(true)

//       // Retrieve user from localStorage to link transaction to account
//       const userStr = localStorage.getItem("civicchain_user")
//       const user = userStr ? JSON.parse(userStr) : { id: "guest" }

//       const response = await fetch("/api/transactions", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           type: "payment",
//           amount: validatedData.amount, 
//           description: validatedData.description,
//           paymentType: validatedData.paymentType,
//           userId: user.id, // Linked user ID
//         }),
//       })

//       const transaction = await response.json()

//       if (!response.ok) throw new Error(transaction.error || "Payment failed")

//       // Format for UI display
//       const formattedAmount = `₦ ${Number.parseFloat(validatedData.amount).toLocaleString()}`

//       addTransaction({
//         ...transaction,
//         amount: formattedAmount
//       })
      
//       setTransactionData({
//         ...validatedData,
//         ...transaction,
//         amount: formattedAmount
//       })

//       setFormData({
//         paymentType: "",
//         amount: "",
//         description: "",
//         recipientEmail: "",
//       })
//       setOpen(false)
//       setShowConfirmation(true)
//     } catch (error: any) {
//       console.error("Payment error:", error)
//       if (error.errors) {
//         // Zod validation errors
//         const newErrors: any = {}
//         error.errors.forEach((err: any) => {
//           newErrors[err.path[0]] = err.message
//         })
//         setErrors(newErrors)
//       } else {
//         // API errors
//         setErrors({ description: error.message || "Transaction failed" })
//       }
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <>
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogTrigger asChild>
//           <Button
//             variant="outline"
//             className="h-auto flex flex-col items-center justify-center p-4 gap-2 bg-transparent border-border w-full"
//           >
//             <Send className="h-5 w-5 text-accent" />
//             <span className="text-sm font-medium">Make Payment</span>
//           </Button>
//         </DialogTrigger>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Make Payment</DialogTitle>
//             <DialogDescription>Enter your payment details below to proceed with the transaction.</DialogDescription>
//           </DialogHeader>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Payment Type Select */}
//             <div className="grid gap-2">
//               <Label htmlFor="paymentType">Payment Type</Label>
//               <Select
//                 value={formData.paymentType}
//                 onValueChange={(value) => setFormData({ ...formData, paymentType: value })}
//               >
//                 <SelectTrigger id="paymentType">
//                   <SelectValue placeholder="Select a payment type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {paymentTypes.map((type) => (
//                     <SelectItem key={type.id} value={type.id}>
//                       {type.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               {errors.paymentType && <p className="text-destructive text-sm">{errors.paymentType}</p>}
//             </div>

//             {/* Amount Input */}
//             <div className="grid gap-2">
//               <Label htmlFor="amount">Amount (₦)</Label>
//               <input
//                 id="amount"
//                 type="number"
//                 placeholder="Enter amount"
//                 disabled={isLoading}
//                 value={formData.amount}
//                 onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
//                 className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
//               />
//               <p className="text-muted-foreground text-xs">Enter the payment amount in Nigerian Naira</p>
//               {errors.amount && <p className="text-destructive text-sm">{errors.amount}</p>}
//             </div>

//             {/* Description Input */}
//             <div className="grid gap-2">
//               <Label htmlFor="description">Description</Label>
//               <input
//                 id="description"
//                 type="text"
//                 placeholder="e.g., Q4 Civic License Renewal"
//                 disabled={isLoading}
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                 className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
//               />
//               <p className="text-muted-foreground text-xs">Brief description of the payment</p>
//               {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
//             </div>

//             {/* Recipient Email Input */}
//             <div className="grid gap-2">
//               <Label htmlFor="email">Recipient Email</Label>
//               <input
//                 id="email"
//                 type="email"
//                 placeholder="recipient@example.com"
//                 disabled={isLoading}
//                 value={formData.recipientEmail}
//                 onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
//                 className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
//               />
//               <p className="text-muted-foreground text-xs">Email of the payment recipient</p>
//               {errors.recipientEmail && <p className="text-destructive text-sm">{errors.recipientEmail}</p>}
//             </div>

//             <Alert>
//               <AlertCircle className="h-4 w-4 text-accent" />
//               <AlertDescription className="text-xs">
//                 Transactions are processed on the Cardano blockchain and cannot be reversed.
//               </AlertDescription>
//             </Alert>

//             <DialogFooter>
//               <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={isLoading}>
//                 {isLoading ? "Processing..." : "Continue"}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {transactionData && (
//         <PaymentConfirmationModal
//           open={showConfirmation}
//           onOpenChange={setShowConfirmation}
//           transaction={transactionData}
//         />
//       )}
//     </>
//   )
// }

