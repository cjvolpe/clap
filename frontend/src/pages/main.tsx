import {createRoot} from 'react-dom/client'
import {BrowserRouter, Route, Routes} from "react-router";
import LoginPage from "./login.tsx";

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Routes>
            <Route index element={<LoginPage/>}/>
        </Routes>
    </BrowserRouter>,
)