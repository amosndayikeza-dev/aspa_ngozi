import { StrictMode } from "react";
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter'; 
import './App.css' //Tailwind + theme
import { App } from './app/App'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
)