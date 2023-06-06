import ProfileContract from "../../contracts/ProfileContract.cdc"

pub fun checkProfileExistence(address: Address): Bool {
    return ProfileContract.check(address: address)
}

pub fun main(profileAddress: Address) {
    //let profileAddress = 0x1234567890 // Replace with the actual profile address

    let profileExists = checkProfileExistence(address: profileAddress)

    if profileExists {
        log("Profile exists")
    } else {
        log("Profile does not exist")
    }
}
