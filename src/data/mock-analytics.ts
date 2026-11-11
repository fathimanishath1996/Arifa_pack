const DAY = 86_400_000;

/** Sample enquiry counts for the last 30 days, oldest first. The backend will provide this later. */
const ENQUIRY_COUNTS = [3, 5, 4, 2, 6, 5, 3, 4, 7, 5, 6, 3, 4, 6, 5, 7, 4, 6, 3, 7, 5, 2, 3, 8, 6, 9, 7, 5, 10, 8];

export interface DailyCount {
  date: string;
  count: number;
}

export function createDailyEnquiries(now: number): DailyCount[] {
  return ENQUIRY_COUNTS.map((count, index) => ({
    date: new Date(now - (ENQUIRY_COUNTS.length - 1 - index) * DAY).toISOString(),
    count,
  }));
}
