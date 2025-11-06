import React, { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useServices } from "./ServiceContext";

export const ArtifactsContext = createContext(null);

export const ArtifactsProvider = ({ children }) => {
  const [artifacts, setArtifacts] = useState([]);
  const { user } = useAuth();
  const { artifactService, userService } = useServices();

  useEffect(() => {
    const fetchArtifacts = async () => {
      if (user?.uid && artifactService && userService) {
        try {
          const sessionId = await userService.getCurrentSession(user.uid);
          if (sessionId) {
            // The session's artifacts field is a map of artifactIds to true
            const path = `sessions/${sessionId}/artifacts`;
            const artifactIdsObj = await artifactService.getData(path);
            if (artifactIdsObj) {
              // Fetch all artifact objects in parallel
              const ids = Object.keys(artifactIdsObj);
              const artifactObjs = await Promise.all(
                ids.map((id) => artifactService.getArtifact(id))
              );
              setArtifacts(artifactObjs.filter(Boolean));
            } else {
              setArtifacts([]);
            }
          } else {
            setArtifacts([]);
          }
        } catch (error) {
          console.error("Error fetching artifacts from Firebase:", error);
          setArtifacts([]);
        }
      } else {
        setArtifacts([]);
      }
    };

    fetchArtifacts();
  }, [user, artifactService, userService]);

  return (
    <ArtifactsContext.Provider value={{ artifacts, setArtifacts }}>
      {children}
    </ArtifactsContext.Provider>
  );
};
