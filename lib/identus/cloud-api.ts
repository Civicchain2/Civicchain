/**
 * Identus Cloud Agent API Client
 * Integrates with Identus Cloud Agent REST API for DID and Credential operations
 * API Documentation: https://hyperledger.github.io/identus-docs/agent-api/
 */

const IDENTUS_AGENT_URL = process.env.IDENTUS_CLOUD_AGENT_URL || "http://localhost:8080/cloud-agent"
const IDENTUS_API_KEY = process.env.IDENTUS_API_KEY || ""

interface CreateDidRequest {
  documentTemplate?: {
    publicKeys?: Array<{
      id: string
      purpose: string
    }>
    services?: Array<{
      id: string
      type: string
      serviceEndpoint: string
    }>
  }
}

interface CreateDidResponse {
  longFormDid: string
  operation: {
    did: string
  }
}

interface CredentialSchema {
  id: string
  name: string
  version: string
  author: string
  type: string
  attributes: Record<string, any>
}

interface IssueCredentialRequest {
  schemaId: string
  credentialSubject: Record<string, any>
  issuingDid: string
  subjectDid: string
}

interface VerifyCredentialRequest {
  credential: string
}

interface VerifyCredentialResponse {
  verified: boolean
  errors?: string[]
}

/**
 * Create HTTP headers for Identus Cloud Agent requests
 */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (IDENTUS_API_KEY) {
    headers["Authorization"] = `Bearer ${IDENTUS_API_KEY}`
  }

  return headers
}

/**
 * Create a new PRISM DID via Identus Cloud Agent
 */
export async function createPrismDID(
  alias?: string,
  publicKeys?: Array<{ id: string; purpose: string }>,
): Promise<{ did: string; longFormDid: string }> {
  console.log("[v0] Creating PRISM DID via Cloud Agent:", alias)

  try {
    const requestBody: CreateDidRequest = {
      documentTemplate: {
        publicKeys: publicKeys || [],
        services: [],
      },
    }

    const response = await fetch(`${IDENTUS_AGENT_URL}/did-registrar/dids`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create DID: ${response.status} - ${errorText}`)
    }

    const data: CreateDidResponse = await response.json()
    console.log("[v0] PRISM DID created successfully:", data.operation.did)

    return {
      did: data.operation.did,
      longFormDid: data.longFormDid,
    }
  } catch (error: any) {
    console.error("[v0] Error creating PRISM DID:", error)
    throw new Error(`Failed to create PRISM DID: ${error.message}`)
  }
}

/**
 * Resolve a DID to get its DID Document
 */
export async function resolveDID(did: string): Promise<any> {
  console.log("[v0] Resolving DID:", did)

  try {
    const response = await fetch(`${IDENTUS_AGENT_URL}/dids/${encodeURIComponent(did)}`, {
      method: "GET",
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to resolve DID: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] DID resolved successfully")
    return data
  } catch (error: any) {
    console.error("[v0] Error resolving DID:", error)
    throw new Error(`Failed to resolve DID: ${error.message}`)
  }
}

/**
 * Create a credential schema
 */
export async function createCredentialSchema(
  name: string,
  version: string,
  attributes: Record<string, any>,
  author: string,
): Promise<CredentialSchema> {
  console.log("[v0] Creating credential schema:", name)

  try {
    const response = await fetch(`${IDENTUS_AGENT_URL}/schema-registry/schemas`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        name,
        version,
        attributes,
        author,
        type: "CredentialSchema2024",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create schema: ${response.status} - ${errorText}`)
    }

    const data: CredentialSchema = await response.json()
    console.log("[v0] Credential schema created:", data.id)
    return data
  } catch (error: any) {
    console.error("[v0] Error creating credential schema:", error)
    throw new Error(`Failed to create credential schema: ${error.message}`)
  }
}

/**
 * Issue a verifiable credential
 */
export async function issueCredential(request: IssueCredentialRequest): Promise<any> {
  console.log("[v0] Issuing credential for schema:", request.schemaId)

  try {
    const response = await fetch(`${IDENTUS_AGENT_URL}/issue-credentials/credential-offers`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        claims: request.credentialSubject,
        issuingDID: request.issuingDid,
        connectionId: "", // Connection ID if using DIDComm
        credentialDefinitionId: request.schemaId,
        automaticIssuance: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to issue credential: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] Credential issued successfully")
    return data
  } catch (error: any) {
    console.error("[v0] Error issuing credential:", error)
    throw new Error(`Failed to issue credential: ${error.message}`)
  }
}

/**
 * Verify a credential
 */
export async function verifyCredential(credential: string): Promise<VerifyCredentialResponse> {
  console.log("[v0] Verifying credential")

  try {
    const response = await fetch(`${IDENTUS_AGENT_URL}/present-proof/presentations/verify`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        proof: credential,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to verify credential: ${response.status} - ${errorText}`)
    }

    const data: VerifyCredentialResponse = await response.json()
    console.log("[v0] Credential verification result:", data.verified)
    return data
  } catch (error: any) {
    console.error("[v0] Error verifying credential:", error)
    throw new Error(`Failed to verify credential: ${error.message}`)
  }
}

/**
 * Check if Identus Cloud Agent is reachable
 */
export async function checkCloudAgentHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${IDENTUS_AGENT_URL}/_system/health`, {
      method: "GET",
      headers: getHeaders(),
    })

    return response.ok
  } catch (error) {
    console.error("[v0] Cloud Agent health check failed:", error)
    return false
  }
}
