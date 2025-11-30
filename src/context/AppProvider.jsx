/* eslint-disable react/prop-types */

import  { useState } from 'react';
import { AppContext } from './AppContext';


export const AppProvider= ({ children }) => {
    const [urlApi, setUrlApi] = useState(import.meta.env.VITE_API_URL);
   
    return (
        <AppContext.Provider value={{ urlApi, setUrlApi }}>
            {children}
        </AppContext.Provider>
    );
};
