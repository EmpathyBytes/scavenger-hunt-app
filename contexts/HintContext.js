import React, { createContext, useState } from 'react';

export const HintContext = createContext(null);

export const HintProvider = ({ children }) => {
    const [hint, setHint] = useState({name: "", locationName: "", isChallenge: false, latitude: 0, longitude: 0, locationHint: "", description: ""}); // State to hold markers
    
    return (
        <HintContext.Provider value={{ hint, setHint }}>
            {children}
        </HintContext.Provider>
    );
}
