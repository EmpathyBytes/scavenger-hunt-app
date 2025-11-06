import React, { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useServices } from "./ServiceContext";

export const LocationsContext = createContext(null);

export const LocationsProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);
  const { user } = useAuth();
  const { userService } = useServices();

  useEffect(() => {
    const fetchLocations = async () => {
      if (user?.uid) {
        try {
          const sessionId = await userService.getCurrentSession(user.uid);
          const raw = await userService.getFirebaseData(
            `sessions/${sessionId}/locations`
          );
          if (raw) {
            setLocations(
              Object.entries(raw).map(([id, rest]) => ({ id, ...rest }))
            );
          } else {
            setLocations([]);
          }
        } catch (error) {
          console.error("Error fetching locations from Firebase:", error);
        }
      } else {
        setLocations([]);
      }
    };
    fetchLocations();
  }, [user, userService]);

  return (
    <LocationsContext.Provider value={{ locations, setLocations }}>
      {children}
    </LocationsContext.Provider>
  );
};
