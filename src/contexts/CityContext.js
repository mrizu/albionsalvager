import React, { createContext, useState, useContext } from 'react';

const CityContext = createContext();

export const CityProvider = ({ children }) => {
    let [selectedCity, setSelectedCity] = useState('Brecilien');

    return (
        <CityContext.Provider value={{ selectedCity, setSelectedCity }}>
            {children}
        </CityContext.Provider>
    );
};

export const useCityContext = () => useContext(CityContext);