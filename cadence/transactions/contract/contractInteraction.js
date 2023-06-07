//import FlowClient from 0x...

// Initialize Flow client
const client = new FlowClient("http://localhost:8080")

// Function to deploy the escrow contract
const deployEscrowContract = async () => {
  // Deploy the EscrowContract
  const transaction = await client.createTransaction({
    script: `
      import EscrowContract from 0x...

      transaction {
        prepare(signer: AuthAccount) {
          let escrowContract <- EscrowContract.create(
            partyA: signer.address,
            partyB: 0x123456789,
            projectDetails: {
              title: "Sample Project",
              description: "This is a sample project",
              priority: "high"
            },
            deliverables: [
              {
                title: "Deliverable 1",
                description: "This is deliverable 1",
                task: "Task 1",
                amount: 100.0
              }
            ],
            paymentSchedule: {
              initialDeposit: 200.0,
              subsequentDeposit: 150.0,
              paymentDay: 15
            },
            termsAndConditions: {}
          )
          signer.save(<-escrowContract, to: /storage/escrowContract)
        }
      }
    `,
    proposer: client.authorizedAccount,
    authorizations: [client.authorizedAccount],
  })

  // Sign and submit the transaction
  const { status } = await client.sendTransaction(transaction)
  console.log("Escrow contract deployed with status:", status)
}

// Function to interact with the escrow contract
const interactWithEscrowContract = async () => {
  // Load the deployed escrow contract
  const account = await client.getAccount(client.authorizedAccount.address)
  const escrowContractRef = account.getCapability(/storage/escrowContract)?.asPublic()
  const escrowContract = await client.query(escrowContractRef)

  // Create a signable contract
  const transaction = await client.createTransaction({
    script: `
      import SignableContract from 0x...

      transaction {
        prepare(signer: AuthAccount) {
          let signableContract <- SignableContract.create(
            escrowContract: <-signer.load<@EscrowContract>(from: /storage/escrowContract)!,
            agreeingParty: signer.address
          )
          signer.save(<-signableContract, to: /storage/signableContract)
        }
      }
    `,
    proposer: client.authorizedAccount,
    authorizations: [client.authorizedAccount],
  })

  // Sign and submit the transaction
  const { status } = await client.sendTransaction(transaction)
  console.log("Signable contract created with status:", status)

  // Accept and sign the contract
  const acceptAndSignTransaction = await client.createTransaction({
    script: `
      import SignableContract from 0x...

      transaction {
        prepare(signer: AuthAccount) {
          let signableContractRef = signer.getCapability(/storage/signableContract)!.borrow<&SignableContract>(from: /storage/signableContract)
          signableContractRef!.acceptContract()
          signableContractRef!.signContract()
        }
      }
    `,
    proposer: client.authorizedAccount,
    authorizations: [client.authorizedAccount],
  })

  // Sign and submit the transaction
  const { status: acceptAndSignStatus } = await client.sendTransaction(acceptAndSignTransaction)
  console.log("Contract accepted and signed with status:", acceptAndSignStatus)

  // Deposit initial funds
  const depositInitialFundsTransaction = await client.createTransaction({
    script: `
      import EscrowContract from 0x...

      transaction {
        prepare(signer: AuthAccount) {
          let escrowContractRef = signer.getCapability(/storage/escrowContract)!.borrow<&EscrowContract>(from: /storage/escrowContract)
          escrowContractRef!.depositInitialFunds()
        }
      }
    `,
    proposer: client.authorizedAccount,
    authorizations: [client.authorizedAccount],
  })

  // Sign and submit the transaction
  const { status: depositInitialFundsStatus } = await client.sendTransaction(depositInitialFundsTransaction)
  console.log("Initial funds deposited with status:", depositInitialFundsStatus)

  // Deposit subsequent funds
  const depositSubsequentFundsTransaction = await client.createTransaction({
    script: `
      import EscrowContract from 0x...

      transaction {
        prepare(signer: AuthAccount) {
          let escrowContractRef = signer.getCapability(/storage/escrowContract)!.borrow<&EscrowContract>(from: /storage/escrowContract)
          escrowContractRef!.depositSubsequentFunds()
        }
      }
    `,
    proposer: client.authorizedAccount,
    authorizations: [client.authorizedAccount],
  })

  // Sign and submit the transaction
  const { status: depositSubsequentFundsStatus } = await client.sendTransaction(depositSubsequentFundsTransaction)
  console.log("Subsequent funds deposited with status:", depositSubsequentFundsStatus)

  // Release funds
  const releaseFundsTransaction = await client.createTransaction({
    script: `
      import EscrowContract from 0x...

      transaction {
        prepare(signer: AuthAccount) {
          let escrowContractRef = signer.getCapability(/storage/escrowContract)!.borrow<&EscrowContract>(from: /storage/escrowContract)
          escrowContractRef!.releaseFunds()
        }
      }
    `,
    proposer: client.authorizedAccount,
    authorizations: [client.authorizedAccount],
  })

  // Sign and submit the transaction
  const { status: releaseFundsStatus } = await client.sendTransaction(releaseFundsTransaction)
  console.log("Funds released with status:", releaseFundsStatus)

  // Terminate the contract
  const terminateContractTransaction = await client.createTransaction({
    script: `
      import EscrowContract from 0x...

      transaction {
        prepare(signer: AuthAccount) {
          let escrowContractRef = signer.getCapability(/storage/escrowContract)!.borrow<&EscrowContract>(from: /storage/escrowContract)
          escrowContractRef!.terminateContract()
        }
      }
    `,
    proposer: client.authorizedAccount,
    authorizations: [client.authorizedAccount],
  })

  // Sign and submit the transaction
  const { status: terminateContractStatus } = await client.sendTransaction(terminateContractTransaction)
  console.log("Contract terminated with status:", terminateContractStatus)
}

// Deploy the escrow contract
deployEscrowContract()
  .then(() => {
    // Interact with the escrow contract
    interactWithEscrowContract()
  })
  .catch((error) => console.error("Error:", error))