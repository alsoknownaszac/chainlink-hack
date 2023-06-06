// ProfileContract.cdc

//import MetadataViews from "./MetadataViews.cdc" // Address where MetadataViews contract is deployed

pub contract ProfileContract {
    pub let publicPath: PublicPath
    pub let privatePath: StoragePath

    pub resource interface Public {
        pub fun getUsername(): String
        pub fun getGender(): String
        pub fun getName(): String
        pub fun getAvatar(): String
        pub fun getInfo(): String
        pub fun asReadOnly(): ProfileContract.ReadOnly
    }

    pub resource interface Owner {
        pub fun getUsername(): String
        pub fun getGender(): String
        pub fun getName(): String
        pub fun getAvatar(): String
        pub fun getInfo(): String

        pub fun setUsername(username: String)
        pub fun setGender(gender: String)
        pub fun setName(name: String)
        pub fun setAvatar(src: String)
        pub fun setInfo(info: String)
    }

    pub resource Base: Owner, Public {
        access(self) var username: String
        access(self) var gender: String
        access(self) var name: String
        access(self) var avatar: String
        access(self) var info: String

        init() {
            self.username = ""
            self.gender = ""
            self.name = "Anon"
            self.avatar = ""
            self.info = ""
        }

        pub fun getUsername(): String { return self.username }
        pub fun getGender(): String { return self.gender }
        pub fun getName(): String { return self.name }
        pub fun getAvatar(): String { return self.avatar }
        pub fun getInfo(): String { return self.info }

        pub fun setUsername(username: String) {
            self.username = username
        }

        pub fun setGender(gender: String) {
            pre {
                ProfileContract.isValidGender(gender: gender): "Invalid gender value"
            }
            self.gender = gender
        }

        pub fun setName(name: String) {
            self.name = name
        }

        pub fun setAvatar(src: String) {
            self.avatar = src
        }

        pub fun setInfo(info: String) {
            self.info = info
        }

        pub fun asReadOnly(): ProfileContract.ReadOnly {
            return ProfileContract.ReadOnly(
                address: self.owner?.address,
                username: self.getUsername(),
                gender: self.getGender(),
                name: self.getName(),
                avatar: self.getAvatar(),
                info: self.getInfo()
            )
        }
    }

    pub struct ReadOnly {
        pub let address: Address?
        pub let username: String
        pub let gender: String
        pub let name: String
        pub let avatar: String
        pub let info: String

        init(
            address: Address?,
            username: String,
            gender: String,
            name: String,
            avatar: String,
            info: String
        ) {
            self.address = address
            self.username = username
            self.gender = gender
            self.name = name
            self.avatar = avatar
            self.info = info
        }
    }


    // Helper function to validate gender value
    pub fun isValidGender(gender: String): Bool {
        let validGenders = ["male", "female", "other"]
        return validGenders.contains(gender.toLower())
    }

    // Initialize the contract by setting the storage paths and creating a new profile instance
    init() {
        self.publicPath = /public/profile
        self.privatePath = /storage/profile

        self.account.save(<-self.new(), to: self.privatePath)
        self.account.link<&ProfileContract.Base{Public}>(self.publicPath, target: self.privatePath)
    }

    pub fun new(): @ProfileContract.Base {
        return <-create ProfileContract.Base()
    }

    pub fun check(address: Address): Bool {
        return getAccount(address)
            .getCapability<&{ProfileContract.Public}>(ProfileContract.publicPath)
            .check()
    }

    pub fun fetch(address: Address): &{ProfileContract.Public} {
        return getAccount(address)
            .getCapability<&{ProfileContract.Public}>(ProfileContract.publicPath)
            .borrow() ?? panic("Could not fetch profile")
    }

    pub fun read(address: Address): ProfileContract.ReadOnly? {
        if let profile = getAccount(address)
            .getCapability<&{ProfileContract.Public}>(ProfileContract.publicPath)
            .borrow() {
            return profile.asReadOnly()
        } else {
            return nil
        }
    }

    pub fun readMultiple(addresses: [Address]): {Address: ProfileContract.ReadOnly} {
        var profiles: {Address: ProfileContract.ReadOnly} = {}
        for address in addresses {
            let profile = ProfileContract.read(address: address)
            if let existingProfile = profile {
                profiles[address] = existingProfile
            }
        }
        return profiles
    }
}