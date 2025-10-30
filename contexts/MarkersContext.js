import React, { createContext, useRef } from 'react';

export const MarkersContext = createContext(null);

export const MarkersProvider = ({ children }) => {
    const markers = useRef([
        {
            key: 'm1',
            coordinate: { latitude: 33.77011035444347, longitude: -84.3927472105032 },
            title: 'Clue 1',
            description: 'Find the statue'
        },
        {
            key: 'm2',
            coordinate: { latitude: 33.77046811985075, longitude: -84.39443900124264 },
            title: 'Clue 2',
            description: 'Find the building'
        },
        {
            key: 'pg',
            coordinate: { latitude: 33.7756546, longitude: -84.394497},
            title: 'Clue 3', 
            description: 'Find this'
        }
]); // State to hold markers
    
    return (
        <MarkersContext.Provider value={{ markers }}>
            {children}
        </MarkersContext.Provider>
    );
}