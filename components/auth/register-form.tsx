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

export function RegisterForm() {
  const router = useRouter()
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

    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.role) {
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

    
    // try {
    //   const supabase = createClient()

    //   // Sign up the user with Supabase Auth
    //   const { data: authData, error: authError } = await supabase.auth.signUp({
    //     email: formData.email,
    //     password: formData.password,
    //     options: {
    //       emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
    //       data: {
    //         full_name: formData.fullName,
    //         role: formData.role,
    //       },
    //     },
    //   })

    //   if (authError) throw authError
    //   if (!authData.user) throw new Error("Registration failed")
    // console.log("[v0] User registered:", authData.user.id)

    try {
      // Call the real Register API (Database + DID generation)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // Generate Cardano ID
      const cardanoId = `addr1q${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

    // Create user profile in database
        //   const { data: profile, error: profileError } = await supabase
        //     .from("users")
        //     .insert({
        //       id: authData.user.id,
        //       full_name: formData.fullName,
        //       email: formData.email,
        //       role: formData.role,
        //       nin: formData.nin,
        //       nin_verified: false,
        //       cardano_id: cardanoId,
        //     })
        //     .select()
        //     .single()

        //   if (profileError) {
        //     console.error("[v0] Profile creation error:", profileError)
        //     throw new Error("Failed to create user profile")
        //   }

        //   console.log("[v0] User profile created:", profile)

        //   setUser(profile)

        //   // Redirect based on role
        //   if (formData.role === "citizen") {
        //     router.push("/citizen/dashboard")
        //   } else if (formData.role === "officer") {
        //     router.push("/officer/dashboard")
        //   } else if (formData.role === "auditor") {
        //     router.push("/auditor/dashboard")
        //   }
        // } catch (err: any) {
        //   console.error("[v0] Registration error:", err)
        //   setError(err.message || "Failed to create account")
        // } finally {
        //   setLoading(false)
        // }

      // Success: Save user to local storage and redirect
      localStorage.setItem("civicchain_user", JSON.stringify(data));

      if (formData.role === "citizen") {
        router.push("/citizen/dashboard")
      } else if (formData.role === "officer") {
        router.push("/officer/dashboard")
      } else if (formData.role === "auditor") {
        router.push("/auditor/dashboard")
      }
    } catch (err: any) {
      setError(err.message)
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
            placeholder="••••••••"
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
            placeholder="••••••••"
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