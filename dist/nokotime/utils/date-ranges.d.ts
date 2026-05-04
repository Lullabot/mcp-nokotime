/**
 * Date range utilities for Noko time entry filtering
 */
export interface DateRange {
    from: string;
    to: string;
}
/**
 * Get date range for the past N days (including today)
 */
export declare function getCustomRange(days: number): DateRange;
/**
 * Get date range for the past 7 days
 */
export declare function getPastWeek(): DateRange;
/**
 * Get date range for the past 30 days
 */
export declare function getPastMonth(): DateRange;
/**
 * Get date range for the current week (Monday to Sunday)
 */
export declare function getCurrentWeek(): DateRange;
/**
 * Get date range for the current calendar month
 */
export declare function getCurrentMonth(): DateRange;
/**
 * Get date range based on preset period
 */
export declare function getDateRange(period: 'past_week' | 'past_month' | 'current_week' | 'current_month'): DateRange;
