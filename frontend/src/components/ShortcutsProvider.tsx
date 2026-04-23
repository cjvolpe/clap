import {useCallback, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {dispatchFocusSearch, type ShortcutDefinition, useKeyboardShortcuts} from "../lib/keyboardShortcuts.ts";
import ShortcutsHelp from "./ShortcutsHelp.tsx";

interface ShortcutsProviderProps {
    children: React.ReactNode;
}

export default function ShortcutsProvider({children}: ShortcutsProviderProps) {
    const navigate = useNavigate();
    const [helpOpen, setHelpOpen] = useState(false);

    const closeHelp = useCallback(() => setHelpOpen(false), []);

    const shortcuts = useMemo<ShortcutDefinition[]>(() => [
        {keys: "g+h", description: "Go to Home", group: "Navigation", action: () => navigate("/home")},
        {keys: "g+p", description: "Go to Profile", group: "Navigation", action: () => navigate("/profile")},
        {keys: "g+n", description: "Go to New Climb", group: "Navigation", action: () => navigate("/logclimb")},
        {keys: "n", description: "New climb", group: "Actions", action: () => navigate("/logclimb")},
        {keys: "/", description: "Focus search", group: "Actions", action: () => dispatchFocusSearch()},
        {keys: "?", description: "Toggle this help", group: "Help", action: () => setHelpOpen((open) => !open)},
    ], [navigate]);

    useKeyboardShortcuts(shortcuts);

    return (
        <>
            {children}
            <ShortcutsHelp open={helpOpen} onClose={closeHelp} shortcuts={shortcuts}/>
        </>
    );
}
