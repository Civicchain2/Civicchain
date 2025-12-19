"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, FileText, Bell, CheckCircle, Save, RefreshCw, Download, Calendar, Wallet } from "lucide-react"
import { DidWalletLink } from "@/components/settings/did-wallet-link" // Import DID wallet component

export default function AuditorSettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ fullName: "", phone: "" })

  // Auditor-specific settings
  const [auditSettings, setAuditSettings] = useState({
    auto_export_reports: true,
    compliance_alerts: true,
    weekly_summary: true,
  })

  useEffect(() => {
    document.querySelector("nav")?.classList.add("hidden")
    document.querySelector("footer")?.classList.add("hidden")

    const loadUser = async () => {
      try {
        const response = await fetch("/api/user/profile")
        if (!response.ok) {
          router.push("/login")
          return
        }

        const profile = await response.json()
        setUser(profile)
        setFormData({ fullName: profile.fullName || "", phone: profile.phone || "" })
      } catch (err) {
        console.error("Error loading user:", err)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    return () => {
      document.querySelector("nav")?.classList.remove("hidden")
      document.querySelector("footer")?.classList.remove("hidden")
    }
  }, [router])

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
      }
    } catch (err) {
      console.error("Error saving:", err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/auditor/dashboard")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-bold">Auditor Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Auditor Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Email</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-muted-foreground"
                    />
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Role</label>
                  <Badge className="bg-accent text-accent-foreground">System Auditor</Badge>
                </div>
                <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <DidWalletLink />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Report Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">Auto-export Reports</p>
                      <p className="text-sm text-muted-foreground">Automatically export monthly reports</p>
                    </div>
                  </div>
                  <Switch
                    checked={auditSettings.auto_export_reports}
                    onCheckedChange={(checked) => setAuditSettings({ ...auditSettings, auto_export_reports: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">Report Schedule</p>
                      <p className="text-sm text-muted-foreground">Current: Monthly on 1st</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Export History</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">December 2024 Report</p>
                    <p className="text-xs text-muted-foreground">Generated Dec 1, 2024</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">November 2024 Report</p>
                    <p className="text-xs text-muted-foreground">Generated Nov 1, 2024</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Audit Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compliance Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified of compliance issues</p>
                  </div>
                  <Switch
                    checked={auditSettings.compliance_alerts}
                    onCheckedChange={(checked) => setAuditSettings({ ...auditSettings, compliance_alerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Summary</p>
                    <p className="text-sm text-muted-foreground">Weekly audit activity summary</p>
                  </div>
                  <Switch
                    checked={auditSettings.weekly_summary}
                    onCheckedChange={(checked) => setAuditSettings({ ...auditSettings, weekly_summary: checked })}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
