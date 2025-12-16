import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { PaymentForm } from "./payment-form"
import { SubmitVerificationModal } from "./submit-verification-model"
import { ViewRecordsModal } from "./view-records-modal"
import { Zap } from "lucide-react"

export function QuickActions() {
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/user/me")
      const data = await res.json()
      if (res.ok && data.user) setCurrentUser(data.user)
      setLoading(false)
    }
    loadUser()
  }, [])

  if (loading) return <p>Loading...</p>
  if (!currentUser) return <p>User not logged in</p>

  return (
    <Card className="p-6 border border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PaymentForm />
        <SubmitVerificationModal userId={currentUser.id} />
        <ViewRecordsModal />
      </div>
    </Card>
  )
}



// import { Card } from "@/components/ui/card"
// import { PaymentForm } from "./payment-form"
// import { SubmitVerificationModal } from "./submit-verification-model"
// import { ViewRecordsModal } from "./view-records-modal"
// import { Zap } from "lucide-react"

// export function QuickActions() {
//   return (
//     <Card className="p-6 border border-border bg-card">
//       <div className="flex items-center gap-2 mb-4">
//         <Zap className="h-5 w-5 text-primary" />
//         <h2 className="text-lg font-semibold">Quick Actions</h2>
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <PaymentForm />
//         <SubmitVerificationModal userId={currentUser.id} />
//         <ViewRecordsModal />
//       </div>
//     </Card>
//   )
// }
