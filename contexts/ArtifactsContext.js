import React, { createContext, useState } from "react";

export const ArtifactsContext = createContext(null);

export const ArtifactsProvider = ({ children }) => {
  const [artifacts, setArtifacts] = useState([
    {
        art_id: "BuzzDiversityStatue",
        loc_id: "FlagBuilding",
        name: "Buzz Diversity Statue",
        description: "The statue is painted to represent the student life at Georgia Tech. It is placed the Flags Building, serving as a symbol of the diversity within the student body and the unique experiences that unite students from all walks of life. Each element of the design reflects the creativity, resilience, and collaborative spirit that are at the core of the Georgia Tech community.",
        image: require("../assets/Artifacts/BuzzDiversityStatue.png"),
        points: 50,
    },
  ]);

  return (
    <ArtifactsContext.Provider value={{ artifacts, setArtifacts }}>
      {children}
    </ArtifactsContext.Provider>
  );
};
