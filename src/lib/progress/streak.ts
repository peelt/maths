import { emptyStreak, type Streak } from "./types";

/** Days of unbroken activity that earn one freeze. */
const DAYS_PER_FREEZE = 7;
/** Most freezes that can be banked at once. */
const MAX_FREEZES = 3;

/** YYYY-MM-DD in local time, which is what "today" means to a student. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(fromKey: string, toKey: string): number {
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T00:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

/**
 * Record activity on a given day and return the updated streak.
 *
 * Missed days are covered by freezes where there are enough of them, so a
 * genuine run of work is not wiped out by one bad week.
 */
export function recordActivity(streak: Streak, now = new Date()): Streak {
  const today = toDateKey(now);

  if (streak.lastActiveDate === null) {
    return bankFreezes({ ...emptyStreak, current: 1, longest: Math.max(1, streak.longest), lastActiveDate: today, freezes: streak.freezes, daysTowardNextFreeze: 1 });
  }

  const gap = daysBetween(streak.lastActiveDate, today);

  // Already counted today, or a clock that has gone backwards.
  if (gap <= 0) return streak;

  if (gap === 1) {
    const current = streak.current + 1;
    return bankFreezes({
      ...streak,
      current,
      longest: Math.max(streak.longest, current),
      lastActiveDate: today,
      daysTowardNextFreeze: streak.daysTowardNextFreeze + 1,
    });
  }

  // Days entirely missed between the last active day and today.
  const missed = gap - 1;
  if (missed <= streak.freezes) {
    const current = streak.current + 1;
    return bankFreezes({
      ...streak,
      current,
      longest: Math.max(streak.longest, current),
      lastActiveDate: today,
      freezes: streak.freezes - missed,
      daysTowardNextFreeze: streak.daysTowardNextFreeze + 1,
    });
  }

  // Too long away — start again, but keep the record and any spare freezes.
  return {
    ...streak,
    current: 1,
    longest: Math.max(streak.longest, streak.current),
    lastActiveDate: today,
    daysTowardNextFreeze: 1,
  };
}

function bankFreezes(streak: Streak): Streak {
  if (streak.daysTowardNextFreeze < DAYS_PER_FREEZE) return streak;
  return {
    ...streak,
    freezes: Math.min(MAX_FREEZES, streak.freezes + 1),
    daysTowardNextFreeze: 0,
  };
}

/** Is the streak still live today, without any further work being done? */
export function streakIsLive(streak: Streak, now = new Date()): boolean {
  if (!streak.lastActiveDate) return false;
  return daysBetween(streak.lastActiveDate, toDateKey(now)) <= 1;
}

export { DAYS_PER_FREEZE, MAX_FREEZES };
