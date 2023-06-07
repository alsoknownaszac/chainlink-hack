export const profile = `import ProfileContract from 0xProfile

transaction {
    prepare(signer: AuthAccount) {
        let profile <- ProfileContract.new()

        let publicPath = ProfileContract.publicPath
        signer.save(<-profile, to: /storage/profile)
        signer.link<&{ProfileContract.Public}>(publicPath, target: /storage/profile)
    }
}
`;
