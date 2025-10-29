import React, { createContext, useState } from "react";

export const LocationsContext = createContext(null);

export const LocationsProvider = ({ children }) => {
  const [locations, setLocations] = useState([
    {
        id: "FlagBuilding",
        name: "Flag Building",
        hint: "With a exterior design of brick and glass, this building showcases 124 flags suspending from the ceiling. Outside, you can find a statue of George C. Griffin, watching over the entrance — can you find it?.",
        description: "The Smithgall Student Services Building (aka Flag Building) currently holds 124 flags. Each flag represents the nationality of every student currently attending Georgia Tech. As tradition, if you're the first person from your country to come to Georgia Tech may hang your flag up. This building is home to the Women's and LGBTQIA Resource Center, 24/7 counseling services, and the office for disabilities.",
        coordinate: { latitude: 33.77434779727544, longitude: -84.3995862884426 },
        artifacts: ["BuzzDiversityStatue"],
    },
  ]);

  return (
    <LocationsContext.Provider value={{ locations, setLocations }}>
      {children}
    </LocationsContext.Provider>
  );
};
