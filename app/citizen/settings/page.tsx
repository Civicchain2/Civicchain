"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  User,
  Shield,
  Wallet,
  Bell,
  Key,
  Smartphone,
  Mail,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
} from "lucide-react"

export default function CitizenSettingsPage() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [showNin, setShowNin] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
  })

  const [notifications, setNotifications] = useState({
    email_transactions: true,
    email_verifications: true,
    email_security: true,
    push_transactions: false,
    push_verifications: false,
  })

  useEffect(() => {
    document.querySelector("nav")?.classList.add("hidden")
    document.querySelector("footer")?.classList.add("hidden")

    if (!user) {
      router.push("/login")
      return
    }

    setFormData({
      fullName: user.fullName || "",
      phone: "",
    })
    setLoading(false)

    return () => {
      document.querySelector("nav")?.classList.remove("hidden")
      document.querySelector("footer")?.classList.remove("hidden")
    }
  }, [router, user])

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSaveProfile = () => {
    if (!user) return
    setSaving(true)

    const updatedUser = { ...user, fullName: formData.fullName }
    setUser(updatedUser)

    // Update in localStorage users array
    const storedUsers = localStorage.getItem("civicchain-users")
    if (storedUsers) {
      const users = JSON.parse(storedUsers)
      const updatedUsers = users.map((u: any) => (u.id === user.id ? { ...u, fullName: formData.fullName } : u))
      localStorage.setItem("civicchain-users", JSON.stringify(updatedUsers))
    }

    setTimeout(() => setSaving(false), 500)
  }

  const handleRegenerateCardanoId = () => {
    if (!user) return

    const newCardanoId = `addr1q${Date.now().toString(36)}${Math.random().toString(36).substring(2, 30)}`
    const updatedUser = { ...user, cardanoId: newCardanoId }
    setUser(updatedUser)

    // Update in localStorage
    const storedUsers = localStorage.getItem("civicchain-users")
    if (storedUsers) {
      const users = JSON.parse(storedUsers)
      const updatedUsers = users.map((u: any) => (u.id === user.id ? { ...u, cardanoId: newCardanoId } : u))
      localStorage.setItem("civicchain-users", JSON.stringify(updatedUsers))
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/citizen/dashboard")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-bold">Account Settings</h1>
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
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
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
                  <label className="text-sm text-muted-foreground mb-1 block">Email Address</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={user.email || ""}
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
                  <label className="text-sm text-muted-foreground mb-1 block">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 000 000 0000"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>

            {/* NIN Section */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">National Identification</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    NIN (National Identification Number)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-lg">
                      <span className="font-mono">{showNin ? user.nin : user.nin?.replace(/./g, "•")}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNin(!showNin)}
                        className="ml-auto h-6 w-6 p-0"
                      >
                        {showNin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {user.ninVerified ? (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Password & Authentication</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Cardano Identity</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Cardano Address ID</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-xs font-mono break-all">
                      {user.cardanoId}
                    </code>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(user.cardanoId || "", "cardano")}>
                      {copied === "cardano" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button variant="outline" onClick={handleRegenerateCardanoId} className="gap-2 bg-transparent">
                  <RefreshCw className="h-4 w-4" />
                  Regenerate Cardano ID
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Connected Wallet</h2>
              {user.walletAddress ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                    <Wallet className="h-5 w-5 text-accent" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Wallet Connected</p>
                      <code className="text-xs text-muted-foreground font-mono">
                        {user.walletAddress.substring(0, 20)}...
                      </code>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(user.walletAddress || "", "wallet")}>
                      {copied === "wallet" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {user.walletVerified && (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified on Blockchain
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">No wallet connected</p>
                  <Button onClick={() => router.push("/citizen/dashboard")}>Connect Wallet</Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Email Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">Transaction Alerts</p>
                      <p className="text-sm text-muted-foreground">Get notified about payment activities</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email_transactions}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email_transactions: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">Verification Updates</p>
                      <p className="text-sm text-muted-foreground">Status changes on your documents</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email_verifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email_verifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-muted-foreground">Login attempts and security events</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email_security}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email_security: checked })}
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
