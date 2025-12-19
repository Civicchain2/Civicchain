import { Card } from "@/components/ui/card"
import { PaymentForm } from "./payment-form"
import { SubmitVerificationModal } from "./submit-verification-modal"
import { ViewRecordsModal } from "./view-records-modal"
import { Zap } from "lucide-react"

export function QuickActions() {
  return (
    <Card className="p-6 border border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PaymentForm />
        <SubmitVerificationModal />
        <ViewRecordsModal />
      </div>
    </Card>
  )
}
