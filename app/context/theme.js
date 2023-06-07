"use client";

import { useTransaction } from "@/contexts/TransactionContext";
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext({});

export const ThemeContextProvider = ({ children }) => {
  const { initTransactionState, setTxId, setTransactionStatus } =
    useTransaction();
  const [currentUser, setUser] = useState({ loggedIn: false, addr: undefined });
  const [userProfile, setProfile] = useState(null);
  const [profileExists, setProfileExists] = useState(false);

  console.log(
    currentUser,
    setUser,
    userProfile,
    setProfile,
    profileExists,
    setProfileExists,
    initTransactionState,
    setTxId,
    setTransactionStatus
  );

  return (
    <ThemeContext.Provider
      value={{
        currentUser,
        setUser,
        userProfile,
        setProfile,
        profileExists,
        setProfileExists,
        initTransactionState,
        setTxId,
        setTransactionStatus,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
