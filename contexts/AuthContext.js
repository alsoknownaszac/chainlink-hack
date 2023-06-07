import { useRouter } from "next/navigation";
import * as fcl from "@onflow/fcl";
import { profile } from "@/cadence/transactions/profile/CreateNewProfile";
import { updateProfileFun } from "@/cadence/transactions/profile/UpdateProfile";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  // useState,
} from "react";
import { deleteProfileFun } from "@/cadence/transactions/profile/DeleteProfile";
// import { useTransaction } from "./TransactionContext";

export const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const router = useRouter();
  // const { initTransactionState, setTxId, setTransactionStatus } =
  //   useTransaction();
  // const [currentUser, setUser] = useState({ loggedIn: false, addr: undefined });
  // const [userProfile, setProfile] = useState(null);
  // const [profileExists, setProfileExists] = useState(false);

  const {
    currentUser,
    setUser,
    userProfile,
    setProfile,
    profileExists,
    setProfileExists,
    initTransactionState,
    setTxId,
    setTransactionStatus,
  } = useThemeContext();

  useEffect(() => fcl.currentUser.subscribe(setUser), []);

  const loadProfile = useCallback(async () => {
    const profile = await fcl.query({
      cadence: `
        import Profile from 0xProfile

        pub fun main(address: Address): Profile.ReadOnly? {
          return Profile.read(address)
        }
      `,
      args: (arg, t) => [arg(currentUser.addr, t.Address)],
    });
    setProfile(profile ?? null);
    setProfileExists(profile !== null);
    return profile;
  }, [currentUser, setProfile, setProfileExists]);

  useEffect(() => {
    // Upon login check if a userProfile exists
    if (currentUser.loggedIn && userProfile === null) {
      loadProfile();
    }
  }, [currentUser, userProfile, loadProfile]);

  const logOut = async () => {
    await fcl.unauthenticate();
    setUser({ addr: undefined, loggedIn: false });
    setProfile(null);
    setProfileExists(false);
  };

  const logIn = () => {
    fcl.logIn();
  };

  const signUp = () => {
    fcl.signUp();
  };

  const createProfile = async () => {
    initTransactionState();

    const transactionId = await fcl.mutate({
      cadence: profile,
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 50,
    });
    setTxId(transactionId);
    fcl.tx(transactionId).subscribe((res) => {
      setTransactionStatus(res.status);
      if (res.status === 4) {
        loadProfile();
      }
    });
  };

  const updateProfile = async ({ username, name, gender, info }) => {
    console.log("Updating profile", { username, name, gender, info });
    initTransactionState();

    const transactionId = await fcl.mutate({
      cadence: updateProfileFun,
      args: (arg, t) => [
        arg(username, t.String),
        arg(name, t.String),
        arg(gender, t.String),
        arg(info, t.String),
      ],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 50,
    });
    setTxId(transactionId);
    fcl.tx(transactionId).subscribe((res) => {
      setTransactionStatus(res.status);
      if (res.status === 4) {
        loadProfile();
      }
    });
  };

  const deleteProfile = async ({ address }) => {
    console.log("Updating profile", { address });
    initTransactionState();

    const transactionId = await fcl.mutate({
      cadence: deleteProfileFun,
      args: (arg, t) => [arg(address, t.Address)],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 50,
    });
    setTxId(transactionId);
    fcl.tx(transactionId).subscribe((res) => {
      setTransactionStatus(res.status);
      if (res.status === 4) {
        router.replace("/");
      }
    });
  };

  const value = {
    currentUser,
    userProfile,
    profileExists,
    logOut,
    logIn,
    signUp,
    loadProfile,
    createProfile,
    updateProfile,
    deleteProfile,
  };

  console.log("AuthProvider", value);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
