// Import necessary contracts
import FungibleToken from "./FungibleToken.cdc"
import FlowToken from "./FlowToken.cdc"
import FlowFees from "./FlowFees.cdc"

// Define data structures

pub enum Priority {
    case low
    case medium
    case high
}

pub struct ProjectDetails {
    pub let title: String
    pub let description: String
    pub let priority: Priority
}

pub struct Deliverable {
    pub let title: String
    pub let description: String
    pub let task: String
    pub let amount: UFix64
}

pub struct PaymentSchedule {
    pub let initialDeposit: UFix64
    pub let subsequentDeposit: UFix64
    pub let paymentDay: UInt8
}

pub struct TermsAndConditions {
    // Define the required terms and conditions fields here
    // such as acceptance, warranty, confidentiality, etc.
}

pub contract EscrowContract {
    // Define the escrow contract state

    // Parties involved
    pub let partyA: Address
    pub let partyB: Address

    // Project details
    pub let projectDetails: ProjectDetails

    // Project deliverables
    pub var deliverables: [Deliverable]

    // Payment schedule
    pub let paymentSchedule: PaymentSchedule

    // Terms and conditions
    pub let termsAndConditions: TermsAndConditions

    // Contract status
    pub var isContractActive: Bool

    // Constructor to initialize the escrow contract
    pub init(
        partyA: Address,
        partyB: Address,
        projectDetails: ProjectDetails,
        deliverables: [Deliverable],
        paymentSchedule: PaymentSchedule,
        termsAndConditions: TermsAndConditions
    ) {
        self.partyA = partyA
        self.partyB = partyB
        self.projectDetails = projectDetails
        self.deliverables = deliverables
        self.paymentSchedule = paymentSchedule
        self.termsAndConditions = termsAndConditions
        self.isContractActive = true
    }

    // Function to deposit initial funds into the contract
    pub fun depositInitialFunds() {
        let depositAmount = self.paymentSchedule.initialDeposit

        // Validate input
        if depositAmount <= UFix64(0.0) {
            panic("Invalid deposit amount")
        }

        // Authenticate party
        if !Flow.checkRef(self.partyA) {
            panic("Unauthorized access")
        }

        // Transfer tokens from party A to the contract
        let tokenVault <- getAccount(self.partyA).getCapability<&FlowToken.Vault{FungibleToken.Balance}>(/public/flowTokenBalance)!.borrow()!
        let depositVault <- self.getFlowTokenVault() as! @FlowToken.Vault{FungibleToken.Balance}
        depositVault.deposit(from: <-tokenVault.withdraw(amount: depositAmount))
    }

    // Function to deposit subsequent funds based on the payment schedule
    pub fun depositSubsequentFunds() {
        let depositAmount = self.paymentSchedule.subsequentDeposit

        // Validate input
        if depositAmount <= UFix64(0.0) {
            panic("Invalid deposit amount")
        }

        // Authenticate party
        if !Flow.checkRef(self.partyB) {
            panic("Unauthorized access")
        }

        // Transfer tokens from party B to the contract
        let tokenVault <- getAccount(self.partyB).getCapability<&FlowToken.Vault{FungibleToken.Balance}>(/public/flowTokenBalance)!.borrow()!
        let depositVault <- self.getFlowTokenVault() as! @FlowToken.Vault{FungibleToken.Balance}
        depositVault.deposit(from: <-tokenVault.withdraw(amount: depositAmount))
    }

    // Function to release funds to the respective party
    pub fun releaseFunds() {
        // Authenticate party
        if !(Flow.checkRef(self.partyA) || Flow.checkRef(self.partyB)) {
            panic("Unauthorized access")
        }

        // Get the token vault for the respective party
        let recipientVault: @FlowToken.Vault{FungibleToken.Balance}

        if Flow.checkRef(self.partyA) {
            recipientVault = self.getPartyAVault() as! @FlowToken.Vault{FungibleToken.Balance}
        } else {
            recipientVault = self.getPartyBVault() as! @FlowToken.Vault{FungibleToken.Balance}
        }

        // Withdraw funds from the contract and transfer to the recipient
        recipientVault.deposit(from: <-self.getFlowTokenVault() as! @FlowToken.Vault{FungibleToken.Balance}.withdraw(amount: self.getContractBalance()))
    }

    // Function to terminate the contract
    pub fun terminateContract() {
        // Authenticate party
        if !Flow.checkRef(self.partyA) {
            panic("Unauthorized access")
        }

        self.isContractActive = false
    }

    // Helper functions

    // Get the Flow token vault for the contract
    pub fun getFlowTokenVault(): &AnyResource{FungibleToken.Balance} {
        return getAccount(self.address)
            .getCapability<&FlowToken.Vault{FungibleToken.Balance}>(/public/flowTokenBalance)
            .borrow() ?? panic("Could not borrow vault reference")
    }

    // Get the vault for party A
    pub fun getPartyAVault(): &AnyResource{FungibleToken.Balance} {
        return getAccount(self.partyA)
            .getCapability<&FlowToken.Vault{FungibleToken.Balance}>(/public/flowTokenBalance)
            .borrow() ?? panic("Could not borrow vault reference for party A")
    }

    // Get the vault for party B
    pub fun getPartyBVault(): &AnyResource{FungibleToken.Balance} {
        return getAccount(self.partyB)
            .getCapability<&FlowToken.Vault{FungibleToken.Balance}>(/public/flowTokenBalance)
            .borrow() ?? panic("Could not borrow vault reference for party B")
    }

    // Get the contract balance
    pub fun getContractBalance(): UFix64 {
        return self.getFlowTokenVault().balance
    }
}

// Signable Contract

pub contract SignableContract {
    // Define the signable contract state

    // Escrow contract reference
    pub let escrowContract: &EscrowContract

    // Party agreeing to the contract
    pub let agreeingParty: Address

    // Contract acceptance status
    pub var isContractAccepted: Bool

    // Contract signing status
    pub var isContractSigned: Bool

    // Constructor to initialize the signable contract
    pub init(escrowContract: &EscrowContract, agreeingParty: Address) {
        self.escrowContract = escrowContract
        self.agreeingParty = agreeingParty
        self.isContractAccepted = false
        self.isContractSigned = false
    }

    // Function to accept the contract
    pub fun acceptContract() {
        // Authenticate party
        if !Flow.checkRef(self.agreeingParty) {
            panic("Unauthorized access")
        }

        self.isContractAccepted = true
    }

    // Function to sign the contract
    pub fun signContract() {
        // Authenticate party
        if !Flow.checkRef(self.agreeingParty) {
            panic("Unauthorized access")
        }

        // Ensure the contract has been accepted
        if !self.isContractAccepted {
            panic("Contract must be accepted before signing")
        }

        self.isContractSigned = true
    }
}
