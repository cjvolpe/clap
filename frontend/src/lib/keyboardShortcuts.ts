import {useEffect} from "react";

export interface ShortcutDefinition {
    keys: string;
    description: string;
    group: "Navigation" | "Actions" | "Help";
    action: () => void;
}

const CHORD_TIMEOUT_MS = 1000;

function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable) return true;
    const tag = target.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export const FOCUS_SEARCH_EVENT = "clapp:focus-search";

export function dispatchFocusSearch() {
    window.dispatchEvent(new CustomEvent(FOCUS_SEARCH_EVENT));
}

export function useKeyboardShortcuts(shortcuts: ShortcutDefinition[]): void {
    useEffect(() => {
        const chordMap = new Map<string, Map<string, ShortcutDefinition>>();
        const singleMap = new Map<string, ShortcutDefinition>();

        for (const shortcut of shortcuts) {
            const parts = shortcut.keys.split("+").map((p) => p.trim().toLowerCase());
            if (parts.length === 1) {
                singleMap.set(parts[0], shortcut);
            } else if (parts.length === 2) {
                const [first, second] = parts;
                let inner = chordMap.get(first);
                if (!inner) {
                    inner = new Map();
                    chordMap.set(first, inner);
                }
                inner.set(second, shortcut);
            }
        }

        let pendingChord: string | null = null;
        let chordTimer: ReturnType<typeof setTimeout> | null = null;

        const clearChord = () => {
            pendingChord = null;
            if (chordTimer) {
                clearTimeout(chordTimer);
                chordTimer = null;
            }
        };

        const handler = (event: KeyboardEvent) => {
            if (event.metaKey || event.ctrlKey || event.altKey) return;
            if (isTypingTarget(event.target)) return;

            const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

            if (pendingChord) {
                const inner = chordMap.get(pendingChord);
                const match = inner?.get(key);
                clearChord();
                if (match) {
                    event.preventDefault();
                    match.action();
                }
                return;
            }

            if (chordMap.has(key)) {
                pendingChord = key;
                chordTimer = setTimeout(clearChord, CHORD_TIMEOUT_MS);
                return;
            }

            const direct = singleMap.get(key);
            if (direct) {
                event.preventDefault();
                direct.action();
            }
        };

        window.addEventListener("keydown", handler);
        return () => {
            window.removeEventListener("keydown", handler);
            if (chordTimer) clearTimeout(chordTimer);
        };
    }, [shortcuts]);
}
