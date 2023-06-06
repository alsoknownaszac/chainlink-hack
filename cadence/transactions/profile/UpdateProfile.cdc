import ProfileContract from "../../contracts/ProfileContract.cdc"

transaction(username: String, gender: String, name: String, src: String, info: String) {
    prepare(acct: AuthAccount) {
        let profile = acct.borrow<&AnyResource{ProfileContract.Owner}>(from: /storage/profile)
            ?? panic("Profile not found")

        profile.setUsername(username: username)
        profile.setGender(gender: gender)
        profile.setName(name: name)
        profile.setAvatar(src: src)
        profile.setInfo(info: info)
    }
}
