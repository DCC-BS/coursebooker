export function formatDate(date: Date | string) {
    return new Intl.DateTimeFormat("de-CH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date(date));
}

export function formatTime(date: Date | string) {
    return new Intl.DateTimeFormat("de-CH", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}
