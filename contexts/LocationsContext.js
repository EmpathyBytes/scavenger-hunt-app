import React, { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { database } from "../firebase_config";
import { DATABASE_CONFIG } from "../config/config";
import { onValue, ref } from "firebase/database";

export const LocationsContext = createContext(null);

export const LocationsProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) {
      setLocations([]);
      return undefined;
    }

    const currentSessionRef = ref(
      database,
      `${DATABASE_CONFIG.baseNode}/users/${user.uid}/currentSession`
    );
    let unsubscribeSession = () => {};

    const unsubscribeUser = onValue(currentSessionRef, (snapshot) => {
      const sessionId = snapshot.val();
      unsubscribeSession();

      if (!sessionId) {
        setLocations([]);
        return;
      }

      const sessionRef = ref(
        database,
        `${DATABASE_CONFIG.baseNode}/sessions/${sessionId}/locations`
      );
      unsubscribeSession = onValue(sessionRef, (sessionSnapshot) => {
        const sessionLocations = sessionSnapshot.val() ?? {};
        setLocations(
          Object.entries(sessionLocations).map(([id, data]) => ({
            id,
            ...(data && typeof data === "object" ? data : {}),
          }))
        );
      });
    });

    return () => {
      unsubscribeSession();
      unsubscribeUser();
    };
  }, [user]);

  return (
    <LocationsContext.Provider value={{ locations, setLocations }}>
      {children}
    </LocationsContext.Provider>
  );
};
