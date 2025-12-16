"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Bell, CheckCircle, Save, RefreshCw, FileCheck, Users } from "lucide-react"

export default function OfficerSettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ full_name: "", phone: "" })

  // Officer-specific settings
  const [officerSettings, setOfficerSettings] = useState({
    auto_approve_low_risk: false,
    daily_digest: true,
    urgent_alerts: true,
  })

  useEffect(() => {
    document.querySelector("nav")?.classList.add("hidden")
    document.querySelector("footer")?.classList.add("hidden")

    const loadUser = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push("/login")
          return
        }

        const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single()

        if (profile) {
          setUser(profile)
          setFormData({ full_name: profile.full_name || "", phone: profile.phone || "" })
        }
      } catch (err) {
        console.error("Error loading user:", err)
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
      const supabase = createClient()
      await supabase.from("profiles").update(formData).eq("id", user.id)
      setUser({ ...user, ...formData })
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
            <Button variant="ghost" size="sm" onClick={() => router.push("/officer/dashboard")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-bold">Officer Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="workflow" className="gap-2">
              <FileCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Workflow</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Officer Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                  <Badge className="bg-accent text-accent-foreground">Government Officer</Badge>
                </div>
                <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Approval Workflow</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">Auto-approve Low Risk</p>
                      <p className="text-sm text-muted-foreground">Automatically approve low-risk verifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={officerSettings.auto_approve_low_risk}
                    onCheckedChange={(checked) =>
                      setOfficerSettings({ ...officerSettings, auto_approve_low_risk: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">Queue Assignment</p>
                      <p className="text-sm text-muted-foreground">Current: General Queue</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Queue
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Digest</p>
                    <p className="text-sm text-muted-foreground">Summary of pending approvals</p>
                  </div>
                  <Switch
                    checked={officerSettings.daily_digest}
                    onCheckedChange={(checked) => setOfficerSettings({ ...officerSettings, daily_digest: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Urgent Alerts</p>
                    <p className="text-sm text-muted-foreground">High-priority verification requests</p>
                  </div>
                  <Switch
                    checked={officerSettings.urgent_alerts}
                    onCheckedChange={(checked) => setOfficerSettings({ ...officerSettings, urgent_alerts: checked })}
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
