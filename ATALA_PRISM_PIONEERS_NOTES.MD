# CivicChain – Atala PRISM Pioneers Lecture Notes & Code Archive

## Author

Denzil Ferreira
Computer & Data Scientist, Software Engineer

© Denzil Ferreira 2022


## Overview

This repository contains lecture notes and accompanying Kotlin code examples from the **Atala PRISM Pioneers Program**, organized and preserved as a practical reference for Self-Sovereign Identity (SSI), Decentralized Identifiers (DIDs), and Verifiable Credentials on Cardano using Atala PRISM.

These notes were taken during the second iteration of the Pioneers program by IOHK and taught by **Dr. Lars Brünjes**. They combine conceptual explanations with real SDK usage and blockchain interaction examples.

The content is intentionally left **unchanged** to preserve its instructional and historical accuracy.



## Program Context

* Program: Atala PRISM Pioneers
* Organizer: IOHK
* Focus: Decentralized Identity and Verifiable Credentials
* Blockchain: Cardano
* SDK: Atala PRISM SDK
* Language: Kotlin



## Lecture 1 – Concepts

### DID – Digital Identifiers

A DID is a globally unique URI that can identify a person, organization, thing, data model, or abstract entity. A DID Controller can cryptographically prove control of the DID.

* Specification: [https://www.w3.org/TR/did-core](https://www.w3.org/TR/did-core)
* In PRISM, DIDs are managed by Cardano’s blockchain

Structure of a DID:

```
scheme:DID Method:DID method-specific identifier
```

Example:

```
did:example:123456789abcdefghi
```


### Verified Credentials

Verified Credentials:

* Are issued by an Issuer identified by a DID
* Are issued to a Holder identified by a DID
* Can be verified by a Verifier
* Are specified by W3C: [https://w3c.github.io/vc-data-model](https://w3c.github.io/vc-data-model)

Example use case:

* A university issues a degree credential to a student
* An employer verifies the credential

### Idea for an Atala PRISM Project

A search engine for employers to find certified professionals.

* Vertical: career and reputation
* Holder: job seeker or professional
* Issuers:

  * Employers
  * Universities
  * Training providers

Credentials could include:

* Proof of employment
* Recommendations
* Academic degrees
* Cloud certifications

Verifier:

* Employer-facing search engine



## Lecture 2 – DID Operations

### DID Operations Specification

* [https://w3c-ccg.github.io/did-resolution/](https://w3c-ccg.github.io/did-resolution/)

Operations:

* Read – resolve and retrieve a DID document
* Create – create a DID with a payload
* Update – update a DID payload
* Deactivate – render a DID unusable



### Types of DIDs in PRISM

All PRISM DIDs follow:

```
did:prism:CONTENT
```

Long Form DID:

* Not stored on the blockchain
* Contains the document payload

Canonical DID:

* Stored on the Cardano blockchain

If a DID exists on-chain, the blockchain version always overrides the embedded payload.



### DID Document

In PRISM, a DID document contains:

* id: String URI of the DID
* publicKeys:

  * id
  * usage: master, issuing, revocation
  * ecKeyData

Key roles:

* master: modify and control the DID
* issuing: issue credentials
* revocation: revoke credentials

Only the DID Controller, holding the private master key, can update the DID.



## Creating a DID

The following example creates an unpublished (Long Form) DID.
The seed is derived from a mnemonic and stored locally.

```kotlin
@PrismSdkInternal
fun main(args: Array<String>) {
    val seedFile = try { args[0] } catch (e: Exception) {throw Exception("expected seed file path as argument")}
    val seed = KeyDerivation.binarySeed(KeyDerivation.randomMnemonicCode(), "passphrase")
    File(seedFile).writeBytes(seed)
    println("wrote seed to file $seedFile")
    println()

    val masterKeyPair = KeyGenerator.deriveKeyFromFullPath(seed, 0, PrismKeyType.MASTER_KEY, 0)
    val unpublishedDid = PrismDid.buildLongFormFromMasterPublicKey(masterKeyPair.publicKey)

    val didCanonical = unpublishedDid.asCanonical().did
    val didLongForm = unpublishedDid.did

    println("canonical: $didCanonical")
    println("long form: $didLongForm")
    println()
}
```



## Reading a DID from the Blockchain

PRISM uses a Node backend API (`ppp.atalaprism.io`) to interact with the blockchain.

```kotlin
val environment = "ppp.atalaprism.io"
val grpcOptions = GrpcOptions("https", environment, 50053)
val nodeAuthApi = NodeAuthApiImpl(grpcOptions)

@PrismSdkInternal
fun main(args: Array<String>) {
    if (args.size != 1) {
        throw Exception("expected exactly one command line argument, the DID")
    }

    val did = try { Did.fromString(args[0]) } catch (e: Exception) { throw Exception("illegal DID: ${args[0]}") }
    val prismDid = try { PrismDid.fromDid(did) } catch (e: Exception) { throw Exception("not a Prism DID: $did") }

    println("trying to retrieve document for $did")
    try {
        val model = runBlocking { nodeAuthApi.getDidDocument(prismDid) }
        println(model.publicKeys.size)
        println(model.didDataModel)
    } catch (e: Exception) {
        println("unknown prism DID")
    }
}
```

Notes:

* Blockchain operations are asynchronous
* `runBlocking` waits for confirmation
* Canonical DIDs only return on-chain documents



## Publishing a DID

Publishing requires several Cardano confirmations.

Utility function to wait for confirmation:

```kotlin
@PrismSdkInternal
fun waitUntilConfirmed(nodePublicApi: NodePublicApi, operationId: AtalaOperationId) {
    var tid = ""
    var status = runBlocking {
            nodePublicApi.getOperationStatus(operationId)
    }
    while (status != AtalaOperationStatus.CONFIRMED_AND_APPLIED &&
        status != AtalaOperationStatus.CONFIRMED_AND_REJECTED
    ) {
        println("Current operation status: ${AtalaOperationStatus.asString(status)}")
        if (tid.isNullOrEmpty()) {
            tid = transactionId(operationId)
            if (!tid.isNullOrEmpty()) {
                println("Transaction id: $tid")
                println("Track the transaction in:\n- https://explorer.cardano-testnet.iohkdev.io/en/transaction?id=$tid")
            }
        }

        Thread.sleep(10000)
        status = runBlocking {
            nodePublicApi.getOperationStatus(operationId)
        }
    }
}
```

Transaction ID helper:

```kotlin
@PrismSdkInternal
fun transactionId(oid: AtalaOperationId): String {
    val node = NodeServiceCoroutine.Client(GrpcClient(grpcOptions))
    val response = runBlocking {
            node.GetOperationInfo(GetOperationInfoRequest(ByteArr(oid.value())))
        }
    return response.transactionId
}
```

Publishing code (unchanged):

```kotlin
@PrismSdkInternal
fun main(args: Array<String>) {
    val seedFile = try { args[0] } catch (e: Exception) { throw Exception("expected seed file path as first argument") }
    val hashFile = try { args[1] } catch (e: Exception) { throw Exception("expected hash file path as second argument") }
    val seed = File(seedFile).readBytes()
    println("read seed from file $seedFile")

    val masterKeyPair = KeyGenerator.deriveKeyFromFullPath(seed, 0, PrismKeyType.MASTER_KEY, 0)
    val unpublishedDid = PrismDid.buildLongFormFromMasterPublicKey(masterKeyPair.publicKey)

    val didCanonical = unpublishedDid.asCanonical().did
    val didLongForm = unpublishedDid.did

    println("canonical: $didCanonical")
    println("long form: $didLongForm")
    println()

    println("publishing DID...")
    var nodePayloadGenerator = NodePayloadGenerator(
            unpublishedDid,
            mapOf(PrismDid.DEFAULT_MASTER_KEY_ID to masterKeyPair.privateKey))
    val createDidInfo = nodePayloadGenerator.createDid()
    val createDidOperationId = runBlocking {
            nodeAuthApi.createDid(
                createDidInfo.payload,
                unpublishedDid,
                PrismDid.DEFAULT_MASTER_KEY_ID)
        }

    println(
        """
        - Sent a request to create a new DID to PRISM Node.
        - The transaction can take up to 10 minutes to be confirmed by the Cardano network.
        - Operation identifier: ${createDidOperationId.hexValue()}
        """.trimIndent())
    println()
    waitUntilConfirmed(nodeAuthApi, createDidOperationId)

    val status = runBlocking { nodeAuthApi.getOperationStatus(createDidOperationId) }
    require(status == AtalaOperationStatus.CONFIRMED_AND_APPLIED) {
        "expected publishing to be applied"
    }

    println("DID published")

    val hash = createDidInfo.operationHash.hexValue
    println("hash: $hash")
    File(hashFile).writeText(hash)
    println("wrote oid hash to file $hashFile")
    println()
}
```



## Lecture 3 – Deactivation

Deactivation is done by revoking the master key.

```kotlin
@PrismSdkInternal
fun main(args: Array<String>) {
    val seedFile = try { args[0] } catch (e: Exception) { throw Exception("expected seed file path as first argument") }
    val oldHashFile = try { args[1] } catch (e: Exception) { throw Exception("expected old hash file path as second argument") }

    val seed = File(seedFile).readBytes()
    println("read seed from file $seedFile")
    val oldHash = Sha256Digest.fromHex(File(oldHashFile).readText())
    println("read old hash from $oldHashFile: ${oldHash.hexValue}")

    val masterKeyPair = KeyGenerator.deriveKeyFromFullPath(seed, 0, PrismKeyType.MASTER_KEY, 0)
    val unpublishedDid = PrismDid.buildLongFormFromMasterPublicKey(masterKeyPair.publicKey)

    val didCanonical = unpublishedDid.asCanonical().did
    val didLongForm = unpublishedDid.did

    println("canonical: $didCanonical")
    println("long form: $didLongForm")
    println()

    println("deactivating DID...")
    var nodePayloadGenerator = NodePayloadGenerator(
            unpublishedDid,
            mapOf(PrismDid.DEFAULT_MASTER_KEY_ID to masterKeyPair.privateKey))
    val updateDidInfo = nodePayloadGenerator.updateDid(
            previousHash = oldHash,
            masterKeyId = PrismDid.DEFAULT_MASTER_KEY_ID,
            keysToRevoke = arrayOf(PrismDid.DEFAULT_MASTER_KEY_ID, PrismDid.DEFAULT_ISSUING_KEY_ID))
    val updateDidOperationId = runBlocking {
            nodeAuthApi.updateDid(
                payload = updateDidInfo.payload,
                did = unpublishedDid.asCanonical(),
                masterKeyId = PrismDid.DEFAULT_MASTER_KEY_ID,
                previousOperationHash = oldHash,
                keysToAdd = arrayOf(),
                keysToRevoke = arrayOf(PrismDid.DEFAULT_MASTER_KEY_ID, PrismDid.DEFAULT_ISSUING_KEY_ID))
        }

    println(
        """
        - Sent a request to deactivate the DID to PRISM Node.
        - The transaction can take up to 10 minutes to be confirmed by the Cardano network.
        - Operation identifier: ${updateDidOperationId.hexValue()}
        """.trimIndent())
    println()
    waitUntilConfirmed(nodeAuthApi, updateDidOperationId)

    val status = runBlocking { nodeAuthApi.getOperationStatus(updateDidOperationId) }
    require(status == AtalaOperationStatus.CONFIRMED_AND_APPLIED) {
        "expected updating to be applied"
    }

    println("DID deactivated")
    println()
}
```



## Lecture 4 – Issuer DIDs & Credentials

Issuer DIDs require:

* MASTER_KEY
* ISSUING_KEY
* REVOCATION_KEY

Creation and publishing code remains unchanged and is preserved exactly as provided.



## Purpose of This Repository

* Preserve authentic Atala PRISM learning material
* Serve as a reference for SSI builders
* Provide real SDK usage examples
* Act as a historical snapshot of early PRISM development


