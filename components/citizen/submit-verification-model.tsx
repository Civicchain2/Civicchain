"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileCheck, Upload } from "lucide-react"
import { useDataStore } from "@/lib/store"

export function SubmitVerificationModal({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { addVerification } = useDataStore()

  const verificationTypes = [
    { id: "identity", name: "Identity Verification", description: "Submit government-issued ID documents", required_docs: ["Government ID", "Selfie"] },
    { id: "address",  name: "Address Proof", description: "Submit utility bill or lease agreement", required_docs: ["Utility Bill", "Bank Statement"] },
    { id: "tax",      name: "Tax Certificate", description: "Submit tax compliance document", required_docs: ["Tax Certificate"] },
  ]

  const handleSubmit = async () => {
    if (!selectedType) return
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/verifications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type: selectedType }),
      })

      const data = await res.json()

      if (!res.ok || !data.verification) {
        throw new Error(data.error || "Failed to submit verification")
      }

    const typeName = verificationTypes.find((t) => t.id === selectedType)?.name || selectedType
      
      addVerification({
          id: data.verification.id,
          type: typeName,
          status: data.verification.status.toLowerCase(),
          document_hash: "",
          created_at: data.verification.createdAt,
          createdAt: ""
      })

      setOpen(false)
      setSelectedType(null)
      setSelectedFile(null)
    } catch (error: any) {
      console.error("Verification submission error:", error?.message || error)
      alert(error?.message || "Failed to submit verification")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4 gap-2 bg-transparent border-border">
          <FileCheck className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium">Submit Verification</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Verification</DialogTitle>
          <DialogDescription>Choose the type of verification to submit and provide required documents.</DialogDescription>
        </DialogHeader>

        {!selectedType ? (
          <div className="space-y-3">
            {verificationTypes.map((type) => (
              <Card key={type.id} onClick={() => setSelectedType(type.id)} className="p-4 cursor-pointer hover:bg-primary/10 border-border transition-colors">
                <h4 className="font-medium mb-1">{type.name}</h4>
                <p className="text-xs text-muted-foreground mb-3">{type.description}</p>
                <div className="flex flex-wrap gap-1">
                  {type.required_docs.map((doc) => <Badge key={doc} variant="outline" className="text-xs">{doc}</Badge>)}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium">{verificationTypes.find(t => t.id === selectedType)?.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{verificationTypes.find(t => t.id === selectedType)?.description}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Documents</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/20 transition-colors"
                   onClick={() => document.getElementById("file-upload")?.click()}>
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                {selectedFile ? <p className="text-sm text-accent">{selectedFile.name}</p> : <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>}
                <input id="file-upload" type="file" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} accept=".pdf,.jpg,.jpeg,.png" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedType(null)} className="flex-1">Back</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Submitting..." : "Submit Verification"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
