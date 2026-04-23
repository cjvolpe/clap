import {useEffect} from "react";
import type {ShortcutDefinition} from "../lib/keyboardShortcuts.ts";
import "../pages/styles/shortcutshelp.css";

interface ShortcutsHelpProps {
    open: boolean;
    onClose: () => void;
    shortcuts: ShortcutDefinition[];
}

function formatKeys(keys: string): string[] {
    return keys.split("+").map((part) => part.trim());
}

export default function ShortcutsHelp({open, onClose, shortcuts}: ShortcutsHelpProps) {
    useEffect(() => {
        if (!open) return;
        const handler = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (!open) return null;

    const groups = shortcuts.reduce<Record<string, ShortcutDefinition[]>>((acc, shortcut) => {
        (acc[shortcut.group] ||= []).push(shortcut);
        return acc;
    }, {});

    return (
        <div
            className={"shortcuts-help-overlay"}
            role={"dialog"}
            aria-modal={"true"}
            aria-label={"Keyboard shortcuts"}
            onClick={onClose}
        >
            <div className={"shortcuts-help-panel"} onClick={(event) => event.stopPropagation()}>
                <div className={"shortcuts-help-header"}>
                    <h2>Keyboard Shortcuts</h2>
                    <button
                        type={"button"}
                        className={"shortcuts-help-close"}
                        onClick={onClose}
                        aria-label={"Close shortcuts help"}
                    >
                        ×
                    </button>
                </div>
                <div className={"shortcuts-help-body"}>
                    {Object.entries(groups).map(([groupName, items]) => (
                        <section key={groupName} className={"shortcuts-help-group"}>
                            <h3>{groupName}</h3>
                            <ul>
                                {items.map((item) => (
                                    <li key={item.keys}>
                                        <span className={"shortcuts-help-keys"}>
                                            {formatKeys(item.keys).map((token, index, arr) => (
                                                <span key={index}>
                                                    <kbd>{token}</kbd>
                                                    {index < arr.length - 1 && (
                                                        <span className={"shortcuts-help-sep"}>then</span>
                                                    )}
                                                </span>
                                            ))}
                                        </span>
                                        <span className={"shortcuts-help-desc"}>{item.description}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
                <div className={"shortcuts-help-footer"}>
                    Press <kbd>?</kbd> to toggle this help. Shortcuts are disabled while typing.
                </div>
            </div>
        </div>
    );
}
