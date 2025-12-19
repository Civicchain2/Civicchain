"use client"

import { Badge } from "@/components/ui/badge"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileX } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogs([])
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <Card className="p-6 border border-border/40">
        <h2 className="text-lg font-semibold mb-4">Immutable Audit Logs</h2>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border border-border/40">
      <h2 className="text-lg font-semibold mb-4">Immutable Audit Logs</h2>
      {logs.length === 0 ? (
        <div className="text-center py-12">
          <FileX className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">There's nothing here yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Audit logs will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/40">
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="border-b border-border/40">
                  <TableCell className="text-sm text-muted-foreground">{log.timestamp}</TableCell>
                  <TableCell className="text-sm font-medium">{log.action}</TableCell>
                  <TableCell className="text-sm">{log.actor}</TableCell>
                  <TableCell className="text-sm font-mono text-accent">{log.target}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[log.status as keyof typeof statusColors]}>
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-accent font-mono">{log.txHash}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  )
}

const statusColors = {
  success: "bg-green-500/10 text-green-700 border-green-200",
  warning: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  error: "bg-red-500/10 text-red-700 border-red-200",
}
