import ProfileContract from "../../contracts/ProfileContract.cdc"

pub fun fetchMultipleProfiles(addresses: [Address]): {Address: ProfileContract.ReadOnly} {
    let profiles: {Address: ProfileContract.ReadOnly} = ProfileContract.readMultiple(addresses: addresses)

    // Log the profiles
    for address in addresses {
        let profile = profiles[address]

        log(profile)
    }

    
    return profiles

}