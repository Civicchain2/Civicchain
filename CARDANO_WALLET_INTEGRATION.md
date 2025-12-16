# Cardano Wallet & Blockchain Integration Guide

This guide provides comprehensive instructions for integrating Cardano wallet connectivity and blockchain functionality into the CivicChain platform.

## Prerequisites

- Node.js 18+ installed
- Basic understanding of Cardano blockchain
- Familiarity with React/Next.js

## 1. Install Required Dependencies

```bash
npm install @meshsdk/core @meshsdk/react lucid-cardano @emurgo/cardano-serialization-lib-browser
```

### Package Overview:
- **@meshsdk/core**: Core library for Cardano operations
- **@meshsdk/react**: React hooks for wallet connection
- **lucid-cardano**: Alternative lightweight library for Cardano transactions
- **@emurgo/cardano-serialization-lib-browser**: Cardano serialization utilities

## 2. Wallet Connection Setup

### Create Wallet Context Provider

Create `lib/cardano/wallet-provider.tsx`:

```tsx
"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { BrowserWallet } from "@meshsdk/core"

interface WalletContextType {
  wallet: BrowserWallet | null
  connected: boolean
  connecting: boolean
  address: string | null
  balance: string | null
  connect: (walletName: string) => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<BrowserWallet | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)

  const connect = async (walletName: string) => {
    setConnecting(true)
    try {
      const availableWallets = BrowserWallet.getInstalledWallets()
      const selectedWallet = availableWallets.find(w => w.name === walletName)
      
      if (!selectedWallet) {
        throw new Error(`${walletName} wallet not installed`)
      }

      const walletInstance = await BrowserWallet.enable(walletName)
      const walletAddress = await walletInstance.getChangeAddress()
      const walletBalance = await walletInstance.getBalance()

      setWallet(walletInstance)
      setAddress(walletAddress)
      setBalance(walletBalance[0]?.quantity || "0")
      setConnected(true)

      // Store connection in localStorage
      localStorage.setItem("connectedWallet", walletName)
    } catch (error) {
      console.error("Wallet connection failed:", error)
      throw error
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    setWallet(null)
    setConnected(false)
    setAddress(null)
    setBalance(null)
    localStorage.removeItem("connectedWallet")
  }

  // Auto-reconnect on page load
  useEffect(() => {
    const savedWallet = localStorage.getItem("connectedWallet")
    if (savedWallet) {
      connect(savedWallet).catch(() => {
        localStorage.removeItem("connectedWallet")
      })
    }
  }, [])

  return (
    <WalletContext.Provider
      value={{ wallet, connected, connecting, address, balance, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider")
  }
  return context
}
```

### Add Provider to Layout

Update `app/layout.tsx`:

```tsx
import { WalletProvider } from "@/lib/cardano/wallet-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## 3. Wallet Connection Component

Create `components/wallet/connect-wallet-button.tsx`:

```tsx
"use client"

import { useState } from "react"
import { useWallet } from "@/lib/cardano/wallet-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Wallet } from 'lucide-react'

const SUPPORTED_WALLETS = [
  { name: "nami", displayName: "Nami", icon: "/wallets/nami.svg" },
  { name: "eternl", displayName: "Eternl", icon: "/wallets/eternl.svg" },
  { name: "flint", displayName: "Flint", icon: "/wallets/flint.svg" },
  { name: "yoroi", displayName: "Yoroi", icon: "/wallets/yoroi.svg" },
]

export function ConnectWalletButton() {
  const { connected, connecting, address, connect, disconnect } = useWallet()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async (walletName: string) => {
    setError(null)
    try {
      await connect(walletName)
      setOpen(false)
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet")
    }
  }

  if (connected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {address.slice(0, 8)}...{address.slice(-6)}
        </span>
        <Button size="sm" variant="outline" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={connecting}>
          <Wallet className="h-4 w-4 mr-2" />
          {connecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Cardano Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to CivicChain
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {SUPPORTED_WALLETS.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => handleConnect(wallet.name)}
            >
              <span className="ml-2">{wallet.displayName}</span>
            </Button>
          ))}
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

## 4. Transaction Creation

Create `lib/cardano/transactions.ts`:

```tsx
import { BrowserWallet, Transaction } from "@meshsdk/core"

export async function createPaymentTransaction(
  wallet: BrowserWallet,
  recipientAddress: string,
  amountInLovelace: string,
  metadata?: Record<string, any>
) {
  const tx = new Transaction({ initiator: wallet })

  // Add payment output
  tx.sendLovelace(recipientAddress, amountInLovelace)

  // Add metadata if provided
  if (metadata) {
    tx.setMetadata(674, metadata)
  }

  // Build and sign transaction
  const unsignedTx = await tx.build()
  const signedTx = await wallet.signTx(unsignedTx)
  const txHash = await wallet.submitTx(signedTx)

  return { txHash, signedTx }
}

export async function queryTransaction(txHash: string) {
  // Use Blockfrost or similar service
  const response = await fetch(
    `https://cardano-mainnet.blockfrost.io/api/v0/txs/${txHash}`,
    {
      headers: {
        project_id: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID || "",
      },
    }
  )
  return response.json()
}
```

## 5. Atala PRISM DID Integration

### Install Atala PRISM SDK

```bash
npm install @atala/prism-wallet-sdk
```

### Create DID Manager

Create `lib/atala/did-manager.ts`:

```tsx
import { Agent, BasicMessage, DIDCommProtocol } from "@atala/prism-wallet-sdk"

export class DIDManager {
  private agent: Agent | null = null

  async initialize() {
    this.agent = new Agent({
      mediatorDID: process.env.NEXT_PUBLIC_MEDIATOR_DID,
      pluto: {
        // Storage configuration
      },
    })
    await this.agent.start()
  }

  async createDID() {
    if (!this.agent) throw new Error("Agent not initialized")
    
    const did = await this.agent.createNewPrismDID()
    return did
  }

  async issueClaim(holderDID: string, claims: Record<string, any>) {
    if (!this.agent) throw new Error("Agent not initialized")
    
    // Issue verifiable credential
    const credential = await this.agent.issueCredential({
      holder: holderDID,
      claims,
      credentialType: "CivicIdentity",
    })
    
    return credential
  }

  async verifyCredential(credentialJWT: string) {
    if (!this.agent) throw new Error("Agent not initialized")
    
    const verified = await this.agent.verifyCredential(credentialJWT)
    return verified
  }
}

export const didManager = new DIDManager()
```

## 6. Environment Variables

Add to `.env.local`:

```env
# Blockfrost API (for blockchain queries)
NEXT_PUBLIC_BLOCKFROST_PROJECT_ID=your_project_id_here

# Atala PRISM
NEXT_PUBLIC_MEDIATOR_DID=did:prism:mediator_did_here
NEXT_PUBLIC_PRISM_AGENT_URL=https://agent.atalaprism.io

# Network (mainnet, preprod, or preview)
NEXT_PUBLIC_CARDANO_NETWORK=preprod
```

## 7. Update Payment Form

Update `components/citizen/payment-form.tsx` to use wallet:

```tsx
import { useWallet } from "@/lib/cardano/wallet-provider"
import { createPaymentTransaction } from "@/lib/cardano/transactions"

export function PaymentForm() {
  const { wallet, connected } = useWallet()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!wallet || !connected) {
      alert("Please connect your wallet first")
      return
    }

    try {
      const { txHash } = await createPaymentTransaction(
        wallet,
        "addr1_recipient_address_here",
        "5000000", // 5 ADA in lovelace
        {
          description: "Civic Payment",
          type: "license_renewal"
        }
      )

      console.log("Transaction submitted:", txHash)
      // Store txHash in your database
    } catch (error) {
      console.error("Payment failed:", error)
    }
  }

  return (
    // ... form JSX
  )
}
```

## 8. Testing

### Test on Cardano Testnet:
1. Get testnet ADA from [Cardano Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/)
2. Switch wallet to testnet/preprod network
3. Use testnet addresses for transactions

### Verify Transactions:
- **Mainnet Explorer**: https://cardanoscan.io/
- **Testnet Explorer**: https://preprod.cardanoscan.io/

## 9. Security Best Practices

- Never store private keys or mnemonics
- Always validate addresses before transactions
- Use HTTPS in production
- Implement rate limiting for API calls
- Validate all user inputs
- Use environment variables for sensitive data

## 10. Resources

- [Mesh SDK Documentation](https://meshjs.dev/)
- [Cardano Documentation](https://docs.cardano.org/)
- [Atala PRISM Documentation](https://atalaprism.io/docs/)
- [Lucid Documentation](https://lucid.spacebudz.io/)

## Support

For issues or questions:
- Cardano Discord: https://discord.gg/cardano
- Atala PRISM: https://discord.gg/atala-prism
