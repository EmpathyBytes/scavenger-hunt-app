import React, { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { database } from "../firebase_config";
import { DATABASE_CONFIG } from "../config/config";
import { onValue, ref } from "firebase/database";

export const ArtifactsContext = createContext(null);

export const ArtifactsProvider = ({ children }) => {
  const [artifacts, setArtifacts] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) {
      setArtifacts([]);
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
        setArtifacts([]);
        return;
      }

      const sessionRef = ref(
        database,
        `${DATABASE_CONFIG.baseNode}/sessions/${sessionId}/artifacts`
      );
      unsubscribeSession = onValue(sessionRef, (sessionSnapshot) => {
        const sessionArtifacts = sessionSnapshot.val() ?? {};
        setArtifacts(
          Object.entries(sessionArtifacts).map(([id, data]) => ({
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
    <ArtifactsContext.Provider value={{ artifacts, setArtifacts }}>
      {children}
    </ArtifactsContext.Provider>
  );
};
