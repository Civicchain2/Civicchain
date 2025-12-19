import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const transactions = [
      {
        id: 1,
        type: "payment" as const,
        description: "Civic License Renewal",
        amount: "₦ 5,000",
        date: "2025-11-08",
        status: "completed" as const,
        txHash: "0x1a2b...3c4d",
      },
      {
        id: 2,
        type: "refund" as const,
        description: "Tax Overpayment Refund",
        amount: "₦ 2,500",
        date: "2025-11-05",
        status: "completed" as const,
        txHash: "0x5e6f...7g8h",
      },
      {
        id: 3,
        type: "payment" as const,
        description: "Utility Bill Payment",
        amount: "₦ 3,200",
        date: "2025-11-01",
        status: "completed" as const,
        txHash: "0x9i0j...1k2l",
      },
    ]

    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const transaction = await request.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    const newTransaction = {
      ...transaction,
      id: Date.now(),
      txHash: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 8)}`,
    }

    return NextResponse.json(newTransaction)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
