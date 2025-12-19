/**
 * Identus Agent for DID and Credential Operations
 * Uses Identus Cloud Agent REST API (no Edge Agent SDK dependency)
 */

import { createPrismDID, resolveDID, issueCredential, verifyCredential, checkCloudAgentHealth } from "./cloud-api"

export interface IdentusAgent {
  start: () => Promise<void>
  stop: () => Promise<void>
  createNewPrismDID: (alias?: string, publicKeys?: any[]) => Promise<{ did: string }>
  resolveDID: (did: string) => Promise<any>
  issueCredential: (params: any) => Promise<any>
  verifyCredential: (credential: string) => Promise<{ verified: boolean; errors?: string[] }>
  isHealthy: () => Promise<boolean>
}

let agentInstance: IdentusAgent | null = null

/**
 * Get or create an Identus Agent instance
 * Uses Identus Cloud Agent REST API
 */
export async function getIdentusAgent(): Promise<IdentusAgent> {
  if (agentInstance) {
    return agentInstance
  }

  const agent: IdentusAgent = {
    start: async () => {
      console.log("Identus Cloud Agent client initialized")
      const isHealthy = await checkCloudAgentHealth()
      if (!isHealthy) {
        console.warn("Warning: Could not reach Identus Cloud Agent. DIDs will use fallback generation.")
      }
    },

    stop: async () => {
      console.log("Identus Cloud Agent client stopped")
    },

    createNewPrismDID: async (alias?: string, publicKeys?: any[]) => {
      try {
        const result = await createPrismDID(alias, publicKeys)
        return { did: result.did }
      } catch (error: any) {
        console.warn("Cloud Agent DID creation failed, using fallback:", error.message)
        // Fallback to mock DID if Cloud Agent is unavailable
        const timestamp = Date.now()
        const randomPart = Math.random().toString(36).substring(2, 15)
        return {
          did: `did:prism:${timestamp}${randomPart}`,
        }
      }
    },

    resolveDID: async (did: string) => {
      return await resolveDID(did)
    },

    issueCredential: async (params: any) => {
      return await issueCredential(params)
    },

    verifyCredential: async (credential: string) => {
      return await verifyCredential(credential)
    },

    isHealthy: async () => {
      return await checkCloudAgentHealth()
    },
  }

  await agent.start()
  agentInstance = agent
  return agent
}

/**
 * Stop the Identus Agent
 */
export async function stopIdentusAgent(): Promise<void> {
  if (agentInstance) {
    await agentInstance.stop()
    agentInstance = null
  }
}
