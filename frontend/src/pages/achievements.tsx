import "./styles/achievements.css";
import HomeRow from "../components/HomeRow.tsx";
import {useEffect, useState} from "react";
import type {User} from "@supabase/supabase-js";
import {supabaseClient} from "../util/supabaseClient.ts";
import {type AchievementStatus, BACKEND_URL} from "../lib/types.ts";

const ICONS: Record<string, string> = {
    trophy: "\u{1F3C6}",
    flame: "\u{1F525}",
    medal: "\u{1F3C5}",
    crown: "\u{1F451}",
    boulder: "\u{1FAA8}",
    rope: "\u{1F9D7}",
    calendar: "\u{1F4C5}",
    streak: "\u26A1",
    palette: "\u{1F3A8}",
    rainbow: "\u{1F308}",
};

export default function Achievements() {
    const [user, setUser] = useState<User>();
    const [badges, setBadges] = useState<AchievementStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const {data: {user}} = await supabaseClient.auth.getUser();
            setUser(user ?? undefined);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        const fetchBadges = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${BACKEND_URL}/achievements/${user.id}`);
                const data = await response.json();
                if (data.success) {
                    setBadges(data.data as AchievementStatus[]);
                } else {
                    console.error("Failed to load achievements:", data.error);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchBadges();
    }, [user]);

    const unlockedCount = badges.filter(b => b.unlocked).length;

    const formatDate = (iso: string | null) => {
        if (!iso) return null;
        const d = new Date(iso);
        if (isNaN(d.getTime())) return null;
        return d.toLocaleDateString();
    };

    return (
        <>
            <div className={"achievements-page"}>
                <div className={"heading"}>
                    <h1>Achievements</h1>
                    <p className={"progress"}>
                        {badges.length > 0
                            ? `${unlockedCount} of ${badges.length} unlocked`
                            : loading
                                ? "Loading..."
                                : "No achievements available"}
                    </p>
                </div>

                <div className={"badges-grid"}>
                    {badges.map(badge => {
                        const icon = ICONS[badge.icon] ?? "\u{1F3C5}";
                        const unlockedDate = formatDate(badge.unlocked_at);
                        return (
                            <div
                                key={badge.id}
                                className={`badge ${badge.unlocked ? "unlocked" : "locked"}`}
                            >
                                <div className={"badge-icon"}>{icon}</div>
                                <div className={"badge-body"}>
                                    <p className={"badge-name"}>{badge.name}</p>
                                    <p className={"badge-description"}>{badge.description}</p>
                                    {badge.unlocked && unlockedDate && (
                                        <p className={"badge-date"}>Unlocked {unlockedDate}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <HomeRow/>
        </>
    );
}
