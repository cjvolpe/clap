import {useEffect, useState} from "react";
import "../pages/styles/installprompt.css";

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
    prompt(): Promise<void>;
}

const STORAGE_KEY = "clapp:install-prompt-dismissed";

function isStandalone(): boolean {
    if (typeof window === "undefined") return false;
    const mql = window.matchMedia?.("(display-mode: standalone)");
    const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    return Boolean(mql?.matches) || iosStandalone;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isStandalone()) return;
        if (localStorage.getItem(STORAGE_KEY) === "1") return;

        const onBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setDeferredPrompt(event as BeforeInstallPromptEvent);
            setVisible(true);
        };

        const onAppInstalled = () => {
            setVisible(false);
            setDeferredPrompt(null);
            localStorage.setItem(STORAGE_KEY, "1");
        };

        window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
        window.addEventListener("appinstalled", onAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
            window.removeEventListener("appinstalled", onAppInstalled);
        };
    }, []);

    const dismiss = () => {
        localStorage.setItem(STORAGE_KEY, "1");
        setVisible(false);
    };

    const install = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted" || outcome === "dismissed") {
            localStorage.setItem(STORAGE_KEY, "1");
        }
        setDeferredPrompt(null);
        setVisible(false);
    };

    if (!visible || !deferredPrompt) return null;

    return (
        <div className={"install-prompt"} role={"dialog"} aria-live={"polite"}>
            <div className={"install-prompt-text"}>
                <strong>Install Clapp</strong>
                <span>Add the app to your home screen for a faster, fullscreen climbing experience.</span>
            </div>
            <div className={"install-prompt-actions"}>
                <button className={"install-prompt-install"} onClick={install} type={"button"}>
                    Install
                </button>
                <button className={"install-prompt-dismiss"} onClick={dismiss} type={"button"} aria-label={"Dismiss install prompt"}>
                    Not now
                </button>
            </div>
        </div>
    );
}
