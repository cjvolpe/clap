import type {SupabaseClient} from "@supabase/supabase-js";

interface CompletedClimbRow {
    id: number;
    climber: string;
    climb: number;
    created_at: string;
    climbs: {
        difficulty: string | null;
        type: string | null;
        color: string | null;
    } | null;
}

export type AchievementCode =
    | "first_climb"
    | "five_climbs"
    | "ten_climbs"
    | "fifty_climbs"
    | "first_v5"
    | "first_510"
    | "ten_in_a_week"
    | "send_streak_3"
    | "color_collector"
    | "rainbow";

export function computeUnlockedCodes(completed: CompletedClimbRow[]): Set<AchievementCode> {
    const unlocked = new Set<AchievementCode>();
    const total = completed.length;

    if (total >= 1) unlocked.add("first_climb");
    if (total >= 5) unlocked.add("five_climbs");
    if (total >= 10) unlocked.add("ten_climbs");
    if (total >= 50) unlocked.add("fifty_climbs");

    if (completed.some(c => isV5OrHarder(c.climbs?.difficulty ?? null))) {
        unlocked.add("first_v5");
    }
    if (completed.some(c => is510OrHarder(c.climbs?.difficulty ?? null))) {
        unlocked.add("first_510");
    }

    const logDays = completed
        .map(c => toDayString(c.created_at))
        .filter((d): d is string => d !== null);

    if (hasWindowOfCount(logDays, 7, 10)) unlocked.add("ten_in_a_week");
    if (hasConsecutiveDayStreak(logDays, 3)) unlocked.add("send_streak_3");

    const colors = new Set(
        completed.map(c => c.climbs?.color).filter((c): c is string => !!c),
    );
    if (colors.size >= 5) unlocked.add("color_collector");
    if (colors.size >= 10) unlocked.add("rainbow");

    return unlocked;
}

function isV5OrHarder(difficulty: string | null): boolean {
    if (!difficulty) return false;
    const match = /^V(\d+)/.exec(difficulty);
    if (!match || match[1] === undefined) return false;
    return parseInt(match[1], 10) >= 5;
}

function is510OrHarder(difficulty: string | null): boolean {
    if (!difficulty) return false;
    const match = /^5\.(\d+)/.exec(difficulty);
    if (!match || match[1] === undefined) return false;
    return parseInt(match[1], 10) >= 10;
}

function toDayString(iso: string | null | undefined): string | null {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
}

function hasWindowOfCount(days: string[], windowDays: number, minCount: number): boolean {
    if (days.length < minCount) return false;
    const sorted = [...days].map(d => Date.parse(d)).sort((a, b) => a - b);
    const windowMs = (windowDays - 1) * 24 * 60 * 60 * 1000;
    let left = 0;
    for (let right = 0; right < sorted.length; right++) {
        while (sorted[right]! - sorted[left]! > windowMs) left++;
        if (right - left + 1 >= minCount) return true;
    }
    return false;
}

function hasConsecutiveDayStreak(days: string[], minStreak: number): boolean {
    if (days.length < minStreak) return false;
    const unique = Array.from(new Set(days)).sort();
    const oneDay = 24 * 60 * 60 * 1000;
    let streak = 1;
    for (let i = 1; i < unique.length; i++) {
        const prev = Date.parse(unique[i - 1]!);
        const curr = Date.parse(unique[i]!);
        if (curr - prev === oneDay) {
            streak++;
            if (streak >= minStreak) return true;
        } else if (curr !== prev) {
            streak = 1;
        }
    }
    return false;
}

export async function evaluateAndPersistUnlocks(
    supabase: SupabaseClient,
    userId: string,
): Promise<{newlyUnlocked: AchievementCode[]} | {error: Error}> {
    const {data: climbs, error: climbsError} = await supabase
        .from("completed_climbs")
        .select("id, climber, climb, created_at, climbs:climb(difficulty, type, color)")
        .eq("climber", userId);
    if (climbsError) return {error: climbsError as unknown as Error};

    const unlocked = computeUnlockedCodes((climbs ?? []) as unknown as CompletedClimbRow[]);
    if (unlocked.size === 0) return {newlyUnlocked: []};

    const {data: catalog, error: catalogError} = await supabase
        .from("achievements")
        .select("id, code")
        .in("code", Array.from(unlocked));
    if (catalogError) return {error: catalogError as unknown as Error};

    const rows = (catalog ?? []).map(a => ({user_id: userId, achievement_id: a.id}));
    if (rows.length === 0) return {newlyUnlocked: []};

    const {data: existing, error: existingError} = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", userId);
    if (existingError) return {error: existingError as unknown as Error};

    const existingIds = new Set((existing ?? []).map(r => r.achievement_id as number));
    const toInsert = rows.filter(r => !existingIds.has(r.achievement_id));

    if (toInsert.length > 0) {
        const {error: insertError} = await supabase.from("user_achievements").insert(toInsert);
        if (insertError) return {error: insertError as unknown as Error};
    }

    const codeById = new Map((catalog ?? []).map(a => [a.id as number, a.code as AchievementCode]));
    const newlyUnlocked = toInsert
        .map(r => codeById.get(r.achievement_id))
        .filter((c): c is AchievementCode => c !== undefined);

    return {newlyUnlocked};
}
