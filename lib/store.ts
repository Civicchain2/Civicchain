import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  fullName: string
  email: string
  role: "citizen" | "officer" | "auditor"
  nin?: string
  ninVerified?: boolean
  cardanoId?: string
  walletAddress?: string
  walletVerified?: boolean
  walletType?: "nami" | "eternl" | "cardano"
}

export interface DidCredential {
  id: string
  type: "identity" | "education" | "employment" | "address" | "tax"
  name: string
  issuer: string
  issuedDate: string
  expiryDate?: string
  verified: boolean
  hash: string
}

export interface DigitalIdentity {
  didUri: string
  publicKey: string
  credentials: DidCredential[]
  createdAt: string
  verificationScore: number
}

export interface Transaction {
  id: number
  type: "payment" | "refund"
  description: string
  amount: string
  date: string
  status: "completed" | "pending" | "failed"
  txHash: string
}

export interface VerificationStatus {
  createdAt: string | number | Date
  id: string
  type: string
  status: "verified" | "pending" | "rejected"
  document_hash?: string
  created_at: string
}

interface AuthStore {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  isAuthenticated: () => boolean
  connectWallet: (walletAddress: string, walletType: "nami" | "eternl" | "cardano") => void
  disconnectWallet: () => void
}

interface DataStore {
  transactions: Transaction[]
  verifications: VerificationStatus[]
  setTransactions: (transactions: Transaction[]) => void
  setVerifications: (verifications: VerificationStatus[]) => void
  addTransaction: (transaction: Transaction) => void
  addVerification: (verification: VerificationStatus) => void
}

interface DidStore {
  identity: DigitalIdentity | null
  setIdentity: (identity: DigitalIdentity) => void
  addCredential: (credential: DidCredential) => void
  verifyCredential: (credentialId: string) => void
  revokeCredential: (credentialId: string) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
      isAuthenticated: () => get().user !== null,
      connectWallet: (walletAddress, walletType) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                walletAddress,
                walletType,
                walletVerified: true,
              }
            : null,
        })),
      disconnectWallet: () =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                walletAddress: undefined,
                walletType: undefined,
                walletVerified: false,
              }
            : null,
        })),
    }),
    {
      name: "civicchain-auth",
    },
  ),
)

export const useDataStore = create<DataStore>((set, get) => ({
  transactions: [],
  verifications: [],
  setTransactions: (transactions) => set({ transactions }),
  setVerifications: (verifications) => set({ verifications }),
  addTransaction: (transaction) =>
    set({
      transactions: [transaction, ...get().transactions],
    }),
  addVerification: (verification) =>
    set({
      verifications: [verification, ...get().verifications],
    }),
}))

export const useDidStore = create<DidStore>()(
  persist(
    (set, get) => ({
      identity: null,
      setIdentity: (identity) => set({ identity }),
      addCredential: (credential) =>
        set((state) => ({
          identity: state.identity
            ? {
                ...state.identity,
                credentials: [credential, ...state.identity.credentials],
              }
            : null,
        })),
      verifyCredential: (credentialId) =>
        set((state) => ({
          identity: state.identity
            ? {
                ...state.identity,
                credentials: state.identity.credentials.map((c) =>
                  c.id === credentialId ? { ...c, verified: true } : c,
                ),
              }
            : null,
        })),
      revokeCredential: (credentialId) =>
        set((state) => ({
          identity: state.identity
            ? {
                ...state.identity,
                credentials: state.identity.credentials.filter((c) => c.id !== credentialId),
              }
            : null,
        })),
    }),
    {
      name: "civicchain-did",
    },
  ),
)
