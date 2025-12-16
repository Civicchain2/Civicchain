"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, ChevronDown, User, CreditCard, Fingerprint } from "lucide-react"
import { ConnectWalletModal } from "@/components/citizen/connect-wallet-modal"
import { useAuthStore, type User as UserType } from "@/lib/store"

interface CitizenHeaderProps {
  user: UserType
}

export function CitizenHeader({ user }: CitizenHeaderProps) {
  const router = useRouter()
  const { logout, connectWallet } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleWalletConnect = (address: string) => {
    connectWallet(address, "nami")
  }

  return (
    <header className="bg-card border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Citizen Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome, {user.fullName}</p>
        </div>

        <div className="flex items-center gap-3">
          <ConnectWalletModal walletAddress={user.walletAddress} onConnect={handleWalletConnect} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.fullName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-2 text-xs space-y-3 border-b border-border/40">
                <div className="flex items-start gap-2">
                  <Fingerprint className="h-4 w-4 text-accent mt-0.5" />
                  <div className="flex-1">
                    <span className="text-muted-foreground block">NIN</span>
                    <span className="font-mono text-foreground">{user.nin || "Not set"}</span>
                    {user.ninVerified && <span className="ml-2 text-green-600 text-[10px]">Verified</span>}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 text-accent mt-0.5" />
                  <div className="flex-1">
                    <span className="text-muted-foreground block">Cardano ID</span>
                    <span className="font-mono text-foreground text-[10px] break-all">
                      {user.cardanoId?.substring(0, 24)}...
                    </span>
                  </div>
                </div>
                {user.walletAddress && (
                  <div className="flex items-start gap-2">
                    <CreditCard className="h-4 w-4 text-accent mt-0.5" />
                    <div className="flex-1">
                      <span className="text-muted-foreground block">Wallet</span>
                      <span className="font-mono text-foreground text-[10px] break-all">
                        {user.walletAddress.substring(0, 24)}...
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <DropdownMenuItem onClick={() => router.push("/citizen/settings")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
