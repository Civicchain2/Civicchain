import { NextResponse } from "next/server"
import { getIdentusAgent } from "@/lib/identus/agent"

/**
 * Check Identus Cloud Agent health status
 */
export async function GET() {
  try {
    const agent = await getIdentusAgent()
    const isHealthy = await agent.isHealthy()

    if (isHealthy) {
      return NextResponse.json({
        status: "healthy",
        message: "Identus Cloud Agent is reachable",
        agentUrl: process.env.IDENTUS_CLOUD_AGENT_URL || "http://localhost:8080/cloud-agent",
      })
    } else {
      return NextResponse.json(
        {
          status: "unhealthy",
          message: "Cannot reach Identus Cloud Agent",
          agentUrl: process.env.IDENTUS_CLOUD_AGENT_URL || "http://localhost:8080/cloud-agent",
        },
        { status: 503 },
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
