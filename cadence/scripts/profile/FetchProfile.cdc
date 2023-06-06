import ProfileContract from "../../contracts/ProfileContract.cdc"

pub fun fetchProfile(address: Address): ProfileContract.ReadOnly? {
    let profile = ProfileContract.read(address: address)

    log(profile)

    return profile
}