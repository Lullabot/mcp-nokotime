/**
 * Date range utilities for Noko time entry filtering
 */
/**
 * Format a date as YYYY-MM-DD string
 */
function formatDate(date) {
    return date.toISOString().split('T')[0];
}
/**
 * Get date range for the past N days (including today)
 */
export function getCustomRange(days) {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days + 1); // +1 to include today
    return {
        from: formatDate(pastDate),
        to: formatDate(today)
    };
}
/**
 * Get date range for the past 7 days
 */
export function getPastWeek() {
    return getCustomRange(7);
}
/**
 * Get date range for the past 30 days
 */
export function getPastMonth() {
    return getCustomRange(30);
}
/**
 * Get date range for the current week (Monday to Sunday)
 */
export function getCurrentWeek() {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    // Calculate days since Monday (0 = Monday, 6 = Sunday)
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysSinceMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
        from: formatDate(monday),
        to: formatDate(sunday)
    };
}
/**
 * Get date range for the current calendar month
 */
export function getCurrentMonth() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
        from: formatDate(firstDay),
        to: formatDate(lastDay)
    };
}
/**
 * Get date range based on preset period
 */
export function getDateRange(period) {
    switch (period) {
        case 'past_week':
            return getPastWeek();
        case 'past_month':
            return getPastMonth();
        case 'current_week':
            return getCurrentWeek();
        case 'current_month':
            return getCurrentMonth();
        default:
            throw new Error(`Unknown period: ${period}`);
    }
}
//# sourceMappingURL=date-ranges.js.map