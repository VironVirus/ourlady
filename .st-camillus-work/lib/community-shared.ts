export type ConfessionSchedule = {
  id: string;
  title: string;
  date: string;
  location: string;
  note: string;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  maxPerSlot: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ConfessionReservation = {
  id: string;
  scheduleId: string;
  fullName: string;
  department: string;
  level: string;
  identifier: string;
  timeSlot: string;
  note: string;
  createdAt: string;
};

export type MissalLanguage = "English" | "Igbo" | "Latin";

export type MissalSection = {
  id: string;
  heading: string;
  body: string;
};

export type MissalEntry = {
  id: string;
  entryType: "order" | "daily";
  language: MissalLanguage;
  date: string;
  title: string;
  celebration: string;
  published: boolean;
  sections: MissalSection[];
  createdAt?: string;
  updatedAt?: string;
};

export type HymnPlan = {
  id: string;
  date: string;
  title: string;
  note: string;
  published: boolean;
  hymns: {
    id: string;
    part: string;
    title: string;
    lyrics: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
};

export const missalLanguages = ["English", "Igbo", "Latin"] as const satisfies readonly MissalLanguage[];

function toTimeValue(value: string) {
  if (!value) {
    return -1;
  }

  const [hours, minutes] = value.split(":").map((item) => Number.parseInt(item, 10));
  return hours * 60 + minutes;
}

function formatTimeValue(value: number) {
  const hours = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (value % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function buildConfessionSlots(schedule: ConfessionSchedule) {
  const start = toTimeValue(schedule.startTime);
  const end = toTimeValue(schedule.endTime);

  if (start < 0 || end < 0 || end <= start) {
    return [];
  }

  const slots: string[] = [];
  const increment = Math.max(5, schedule.slotMinutes || 10);

  for (let cursor = start; cursor + increment <= end; cursor += increment) {
    slots.push(formatTimeValue(cursor));
  }

  return slots;
}
