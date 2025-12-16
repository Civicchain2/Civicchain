"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Copy, Check, ExternalLink, Shield, AlertCircle } from "lucide-react"

interface ConnectWalletModalProps {
  walletAddress?: string
  onConnect?: (walletAddress: string) => void
}

export function ConnectWalletModal({ walletAddress, onConnect }: ConnectWalletModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<"nami" | "eternl" | "cardano" | null>(null)
  const [connected, setConnected] = useState(!!walletAddress)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mockWalletAddress, setMockWalletAddress] = useState(walletAddress || "")

  const handleConnectWallet = async (walletType: "nami" | "eternl" | "cardano") => {
    setSelectedWallet(walletType)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockAddress = `addr1q${walletType.charAt(0)}${Date.now().toString(36)}${Math.random()
        .toString(36)
        .substring(2, 40)}`

      setMockWalletAddress(mockAddress)
      setConnected(true)
      onConnect?.(mockAddress)
    } catch (err) {
      setError("Failed to connect wallet. Please try again.")
    } finally {
      setSelectedWallet(null)
    }
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(mockWalletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDisconnect = () => {
    setMockWalletAddress("")
    setConnected(false)
    setError(null)
  }

  const walletOptions = [
    {
      id: "nami" as const,
      name: "Nami Wallet",
      description: "Most popular Cardano wallet",
      url: "https://namiwallet.io",
    },
    {
      id: "eternl" as const,
      name: "Eternl Wallet",
      description: "Feature-rich web wallet",
      url: "https://eternl.io",
    },
    {
      id: "cardano" as const,
      name: "Cardano Wallet",
      description: "Official Cardano wallet",
      url: "https://cardanowallet.io",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={connected ? "outline" : "default"} className="gap-2" size="sm">
          <Wallet className="h-4 w-4" />
          {connected ? "Wallet Connected" : "Connect Wallet"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-accent" />
            Cardano Wallet Connection
          </DialogTitle>
          <DialogDescription>Connect your Cardano wallet to enable blockchain-verified transactions.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {connected && mockWalletAddress ? (
          <div className="space-y-4">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-accent" />
                <p className="text-sm font-medium">Wallet Connected</p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-foreground break-all flex-1">{mockWalletAddress}</code>
                <Button variant="ghost" size="sm" onClick={handleCopyAddress} className="flex-shrink-0">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Verification Status</span>
              <Badge variant="outline" className="text-green-600 border-green-200">
                <Check className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleDisconnect} variant="destructive" className="flex-1">
                Disconnect
              </Button>
              <Button onClick={() => setIsOpen(false)} variant="outline" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {walletOptions.map((wallet) => (
              <Button
                key={wallet.id}
                onClick={() => handleConnectWallet(wallet.id)}
                disabled={selectedWallet !== null}
                className="w-full justify-between h-auto py-3 px-4"
                variant="outline"
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{wallet.name}</span>
                  <span className="text-xs text-muted-foreground">{wallet.description}</span>
                </div>
                {selectedWallet === wallet.id ? (
                  <div className="animate-spin h-4 w-4 border-2 border-accent border-t-transparent rounded-full" />
                ) : (
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            ))}

            <p className="text-xs text-muted-foreground text-center pt-2">
              Don't have a wallet?{" "}
              <a
                href="https://namiwallet.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Download Nami Wallet
              </a>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
