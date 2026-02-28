import React, { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useServices } from "./ServiceContext";

export const ArtifactsContext = createContext(null);

export const ArtifactsProvider = ({ children }) => {
  const [artifacts, setArtifacts] = useState([]);
  const { user } = useAuth();
  const { sessionService, userService } = useServices();

  useEffect(() => {
    const fetchArtifacts = async () => {
      if (user?.uid) {
        try {
          const sessionId = await userService.getCurrentSession(user.uid);
          const session = await sessionService.getSession(sessionId);
          if (session && session.artifacts) {
            setArtifacts(
              Object.entries(session.artifacts).map(([id, rest]) => ({
                id,
                ...rest,
              }))
            );
          } else {
            setArtifacts([]);
          }
        } catch (error) {
          setArtifacts([]);
        }
      } else {
        setArtifacts([]);
      }
    };
    fetchArtifacts();
  }, [user, sessionService, userService]);

  return (
    <ArtifactsContext.Provider value={{ artifacts, setArtifacts }}>
      {children}
    </ArtifactsContext.Provider>
  );
};
