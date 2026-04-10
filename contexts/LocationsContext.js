import React, { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useServices } from "./ServiceContext";

export const LocationsContext = createContext(null);

export const LocationsProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);
  const { user } = useAuth();
  const { sessionService, userService } = useServices();

  useEffect(() => {
    const fetchLocations = async () => {
      if (user?.uid) {
        try {
          // Get the current session ID for the user
          const sessionId = await userService.getCurrentSession(user.uid);
          // If no sessionId, clear locations and exit
          if (!sessionId) {
            setLocations([]);
            return;
          }
          let raw = null;
          try {
            // Try to fetch session artifacts (locations) for the session
            raw = await sessionService.listSessionArtifacts(sessionId);
          } catch (err) {
            // If the session does not exist, clear locations and exit
            if (err.message && err.message.includes('Session not found')) {
              setLocations([]);
              return;
            } else {
              // For other errors, rethrow
              throw err;
            }
          }
          // If locations are found, set them; otherwise, clear
          if (raw) {
            setLocations(
              Object.entries(raw).map(([id, rest]) => ({ id, ...rest }))
            );
          } else {
            setLocations([]);
          }
        } catch (error) {
          // Log any unexpected errors
          console.error("Error fetching locations from Firebase:", error);
        }
      } else {
        // If no user, clear locations
        setLocations([]);
      }
    };
    fetchLocations();
  }, [user, sessionService, userService]);

  return (
    <LocationsContext.Provider value={{ locations, setLocations }}>
      {children}
    </LocationsContext.Provider>
  );
};
