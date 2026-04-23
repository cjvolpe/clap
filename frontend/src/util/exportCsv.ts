const CSV_COLUMNS: { key: string; header: string }[] = [
    {key: "name", header: "Name"},
    {key: "difficulty", header: "Difficulty"},
    {key: "type", header: "Type"},
    {key: "color", header: "Color"},
    {key: "setter", header: "Setter"},
    {key: "gym", header: "Gym"},
    {key: "date_set", header: "Date Set"},
    {key: "date_completed", header: "Date Completed"},
];

function escapeCell(value: unknown): string {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (/[",\r\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export function climbsToCsv(loggedClimbs: Array<Record<string, unknown>>): string {
    const header = CSV_COLUMNS.map((c) => c.header).join(",");
    const rows = loggedClimbs.map((entry) => {
        const climb = (entry.climbs as Record<string, unknown> | null) ?? {};
        return CSV_COLUMNS.map(({key}) => {
            if (key === "date_completed") return escapeCell(entry.created_at ?? entry.date_completed ?? "");
            return escapeCell(climb[key]);
        }).join(",");
    });
    return [header, ...rows].join("\r\n");
}

export function downloadCsv(filename: string, csv: string) {
    const blob = new Blob([`\uFEFF${csv}`], {type: "text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
