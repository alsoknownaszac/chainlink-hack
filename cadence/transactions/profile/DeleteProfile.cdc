import ProfileContract from "../../contracts/ProfileContract.cdc"

transaction {
    prepare(account: AuthAccount) {
        let profileAddress = account.address
        
        if let profile = ProfileContract.read(address: profileAddress) {
            let address = profile.address
            // Do something with the address
            log(address)

            // Delete the profile
            account.unlink(ProfileContract.publicPath)
            //account.unlink(ProfileContract.privatePath)
        } else {
            // Profile not found
            log("Profile not found")
        }
    }
}