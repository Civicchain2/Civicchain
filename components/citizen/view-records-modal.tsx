"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"

export function ViewRecordsModal() {
  const [open, setOpen] = useState(false)
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadRecords()
    }
  }, [open])

  const loadRecords = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      const { data, error } = await supabase.from("verifications").select("*").order("created_at", { ascending: false })

      if (error) throw error

      // Transform data to match expected format
      const transformedRecords = (data || []).map((item) => ({
        id: item.id,
        type: item.type,
        title: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Verification Record`,
        status: item.status,
        submittedDate: new Date(item.created_at).toLocaleDateString(),
        verifiedDate: item.status === "verified" ? new Date(item.updated_at).toLocaleDateString() : null,
        documentHash: item.document_hash || "N/A",
      }))

      setRecords(transformedRecords)
    } catch (err) {
      console.error("[v0] Error loading records:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (recordId: number) => {
    alert("Download initiated for record " + recordId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-accent/20 text-accent border-accent"
      case "pending":
        return "bg-primary/20 text-primary border-primary"
      case "rejected":
        return "bg-destructive/20 text-destructive border-destructive"
      default:
        return "bg-secondary/20 text-secondary border-secondary"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-auto flex flex-col items-center justify-center p-4 gap-2 bg-transparent border-border"
        >
          <Eye className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium">View Records</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>View Records</DialogTitle>
          <DialogDescription>Access your submitted verification records and documents</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No records found</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {records.map((record) => (
                <RecordCard
                  key={record.id}
                  record={record}
                  getStatusColor={getStatusColor}
                  onDownload={handleDownload}
                />
              ))}
            </TabsContent>

            <TabsContent value="verified" className="space-y-3">
              {records
                .filter((r) => r.status === "verified")
                .map((record) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    getStatusColor={getStatusColor}
                    onDownload={handleDownload}
                  />
                ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-3">
              {records
                .filter((r) => r.status === "pending")
                .map((record) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    getStatusColor={getStatusColor}
                    onDownload={handleDownload}
                  />
                ))}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-3">
              {records
                .filter((r) => r.status === "rejected")
                .map((record) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    getStatusColor={getStatusColor}
                    onDownload={handleDownload}
                  />
                ))}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

function RecordCard({ record, getStatusColor, onDownload }: any) {
  return (
    <Card className="p-4 border-border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium">{record.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">Submitted: {record.submittedDate}</p>
        </div>
        <Badge variant="outline" className={getStatusColor(record.status)}>
          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div>
          <p className="text-muted-foreground">Document Hash</p>
          <p className="font-mono text-accent">{record.documentHash}</p>
        </div>
        {record.verifiedDate && (
          <div>
            <p className="text-muted-foreground">Verified Date</p>
            <p className="font-medium">{record.verifiedDate}</p>
          </div>
        )}
      </div>

      <Button variant="outline" size="sm" onClick={() => onDownload(record.id)} className="w-full">
        <Download className="h-4 w-4 mr-2" />
        Download Record
      </Button>
    </Card>
  )
}
