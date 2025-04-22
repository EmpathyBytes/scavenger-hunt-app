import React, { createContext, useRef } from 'react';

export const MarkersContext = createContext(null);

export const MarkersProvider = ({ children }) => {
    const markers = useRef([]); // State to hold markers
    
    return (
        <MarkersContext.Provider value={{ markers }}>
            {children}
        </MarkersContext.Provider>
    );
}
