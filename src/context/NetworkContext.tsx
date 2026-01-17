import React, { createContext, useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export const NetworkContext = createContext({
  isConnected: true,
});

export const NetworkProvider = ({ children }: any) => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(
        state.isConnected === true && state.isInternetReachable !== false
      );
    });

    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
};
