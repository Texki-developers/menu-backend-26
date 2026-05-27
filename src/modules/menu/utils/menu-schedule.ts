import { DayOfWeek } from '../../branches/constants/constant';
import { ScheduleWindow } from '../schema/menu.schema';

const DAY_INDEX: DayOfWeek[] = [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
];

const toMinutes = (hhmm: string): number => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
};

/**
 * True if `date` falls inside any of the given schedule windows.
 * Empty/missing schedule = always active.
 * Times are interpreted in the wall-clock timezone of `date`.
 * Overnight windows (end < start) wrap past midnight onto the next day.
 */
export function isMenuActiveAt(schedule: ScheduleWindow[] | undefined, date: Date = new Date()): boolean {
    if (!schedule || schedule.length === 0) return true;

    const today = DAY_INDEX[date.getDay()];
    const yesterday = DAY_INDEX[(date.getDay() + 6) % 7];
    const nowMin = date.getHours() * 60 + date.getMinutes();

    for (const w of schedule) {
        const start = toMinutes(w.start_time);
        const end = toMinutes(w.end_time);
        const wraps = end <= start;

        if (!wraps) {
            // Same-day window: today must be in days, and start <= now < end
            if (w.days.includes(today) && nowMin >= start && nowMin < end) return true;
        } else {
            // Overnight: matches if today's evening segment OR yesterday's wrap-into-today segment hits
            if (w.days.includes(today) && nowMin >= start) return true;
            if (w.days.includes(yesterday) && nowMin < end) return true;
        }
    }
    return false;
}
