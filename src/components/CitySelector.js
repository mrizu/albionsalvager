import React from 'react';
import {useCityContext} from '../contexts/CityContext';

export default function CitySelector() {
    const { selectedCity, setSelectedCity } = useCityContext();

    const handleChange = (event) => {
        setSelectedCity(event.target.value);
    };

    return (
        <select className="dropdown-city" value={selectedCity} onChange={handleChange}>
            <option value='Brecilien'>Brecilien</option>
            <option value='Bridgewatch'>Bridgewatch</option>
            <option value='Thetford'>Thetford</option>
            <option value='Fort Sterling'>Fort Sterling</option>
            <option value='Lymhurst'>Lymhurst</option>
            <option value='Martlock'>Martlock</option>
            <option value='Caerleon'>Caerleon</option>
        </select>
    );
}
