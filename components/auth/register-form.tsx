"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthStore } from "@/lib/store"

export function RegisterForm() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    nin: "",
    password: "",
    confirmPassword: "",
    role: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "nin" && !/^\d{0,11}$/.test(value)) {
      return
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.fullName || !formData.email || !formData.password || !formData.role || !formData.nin) {
      setError("Please fill in all fields")
      return
    }

    if (formData.nin.length !== 11) {
      setError("NIN must be 11 digits")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setLoading(true)

    try {
      console.log("[v0] Submitting registration...")

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          nin: formData.nin,
        }),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response content-type:", response.headers.get("content-type"))

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[v0] Server returned non-JSON response")
        throw new Error("Server error: The database may not be properly configured. Please contact support.")
      }

      let data
      try {
        data = await response.json()
        console.log("[v0] Response data:", data)
      } catch (parseError) {
        console.error("[v0] Failed to parse JSON response:", parseError)
        throw new Error("Server returned an invalid response. Please check your database connection.")
      }

      if (!response.ok) {
        if (data.error === "Database schema not initialized") {
          throw new Error(
            "Database tables are not set up. Administrator needs to run 'npx prisma db push' on the database.",
          )
        } else if (data.error === "Database error") {
          throw new Error(`Database error: ${data.details || "Please contact support to initialize the database."}`)
        } else if (data.error === "Database not configured") {
          throw new Error("Database is not configured on the server. Please contact support.")
        }
        throw new Error(data.error || data.details || "Registration failed")
      }

      console.log("[v0] User registered:", data.user.id)

      setUser(data.user)

      // Redirect based on role
      if (formData.role === "citizen") {
        router.push("/citizen/dashboard")
      } else if (formData.role === "officer") {
        router.push("/officer/dashboard")
      } else if (formData.role === "auditor") {
        router.push("/auditor/dashboard")
      }
    } catch (err: any) {
      console.error("[v0] Registration error:", err.message)
      setError(err.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 border border-border/40">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nin">National Identification Number (NIN)</Label>
          <Input
            id="nin"
            name="nin"
            placeholder="12345678901"
            value={formData.nin}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <p className="text-muted-foreground text-xs">11-digit NIN required for verification</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={formData.role} onValueChange={handleRoleChange} disabled={loading}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="citizen">Citizen</SelectItem>
              <SelectItem value="officer">Government Officer</SelectItem>
              <SelectItem value="auditor">Auditor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="********"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="********"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </Card>
  )
}
