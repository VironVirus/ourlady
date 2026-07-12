import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import {
  attendanceRecordsTable,
  attendanceRequestsTable,
  confessionReservationsTable,
  confessionSchedulesTable,
  getSupabaseAdmin,
  hymnPlansTable,
  missalEntriesTable
} from "@/lib/supabase-admin";
import {
  isNetlifyProduction,
  remoteStorageRequiredMessage
} from "@/lib/deployment";
import { getSiteDateKey, siteTimeZone } from "@/lib/site-runtime";
import { slugify } from "@/lib/slug";

export type MemberProfileInput = {
  fullName: string;
  department: string;
  level: string;
  identifier: string;
};

export type AttendanceRequest = {
  id: string;
  title: string;
  date: string;
  location: string;
  note: string;
  opensAt: string;
  closesAt: string;
  token: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AttendanceRecord = MemberProfileInput & {
  id: string;
  requestId: string;
  checkedInAt: string;
};

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

export type ConfessionReservation = MemberProfileInput & {
  id: string;
  scheduleId: string;
  timeSlot: string;
  note: string;
  createdAt: string;
};

export type MissalLanguage = "English" | "Igbo" | "Latin";
export type MissalEntryType = "order" | "daily";

export type MissalSection = {
  id: string;
  heading: string;
  body: string;
};

export type MissalEntry = {
  id: string;
  entryType: MissalEntryType;
  language: MissalLanguage;
  date: string;
  title: string;
  celebration: string;
  published: boolean;
  sections: MissalSection[];
  createdAt?: string;
  updatedAt?: string;
};

export type HymnItem = {
  id: string;
  part: string;
  title: string;
  lyrics: string;
};

export type HymnPlan = {
  id: string;
  date: string;
  title: string;
  note: string;
  published: boolean;
  hymns: HymnItem[];
  createdAt?: string;
  updatedAt?: string;
};

type CommunityModulesData = {
  attendanceRequests: AttendanceRequest[];
  attendanceRecords: AttendanceRecord[];
  confessionSchedules: ConfessionSchedule[];
  confessionReservations: ConfessionReservation[];
  missalEntries: MissalEntry[];
  hymnPlans: HymnPlan[];
};

type AttendanceRequestRecord = {
  id?: unknown;
  title?: unknown;
  date_text?: unknown;
  location?: unknown;
  note?: unknown;
  opens_at?: unknown;
  closes_at?: unknown;
  token?: unknown;
  is_published?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

type AttendanceRecordRow = {
  id?: unknown;
  request_id?: unknown;
  full_name?: unknown;
  department?: unknown;
  level_text?: unknown;
  identifier?: unknown;
  checked_in_at?: unknown;
};

type ConfessionScheduleRow = {
  id?: unknown;
  title?: unknown;
  date_text?: unknown;
  location?: unknown;
  note?: unknown;
  start_time?: unknown;
  end_time?: unknown;
  slot_minutes?: unknown;
  max_per_slot?: unknown;
  is_published?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

type ConfessionReservationRow = {
  id?: unknown;
  schedule_id?: unknown;
  full_name?: unknown;
  department?: unknown;
  level_text?: unknown;
  identifier?: unknown;
  time_slot?: unknown;
  note?: unknown;
  created_at?: unknown;
};

type MissalEntryRow = {
  id?: unknown;
  entry_type?: unknown;
  language?: unknown;
  date_text?: unknown;
  title?: unknown;
  celebration?: unknown;
  is_published?: unknown;
  sections?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

type HymnPlanRow = {
  id?: unknown;
  date_text?: unknown;
  title?: unknown;
  note?: unknown;
  is_published?: unknown;
  hymns?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

const modulesFilePath = path.join(process.cwd(), "data", "community-modules.json");

const defaultCommunityData: CommunityModulesData = {
  attendanceRequests: [],
  attendanceRecords: [],
  confessionSchedules: [],
  confessionReservations: [],
  missalEntries: [],
  hymnPlans: []
};

const missalLanguageOptions = ["English", "Igbo", "Latin"] as const satisfies readonly MissalLanguage[];

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function withId(prefix: string, value: string, index: number) {
  const normalized = slugify(value, `${prefix}-${index + 1}`);
  return normalized || `${prefix}-${index + 1}`;
}

function toIsoNow() {
  return new Date().toISOString();
}

function normalizeTime(value: unknown) {
  const input = asString(value).trim();
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(input) ? input : "";
}

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

function getSiteTimeKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: siteTimeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);

  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

  return `${hour}:${minute}`;
}

function normalizeMemberProfile(input: Partial<MemberProfileInput>) {
  return {
    fullName: asString(input.fullName).trim(),
    department: asString(input.department).trim(),
    level: asString(input.level).trim(),
    identifier: asString(input.identifier).trim()
  };
}

function sanitizeAttendanceRequests(value: unknown): AttendanceRequest[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...value]
    .map((item, index) => {
      const entry = item as Partial<AttendanceRequest>;
      const title = asString(entry.title);
      const createdAt = asString(entry.createdAt);
      const updatedAt = asString(entry.updatedAt);

      return {
        id: asString(entry.id) || withId("attendance", title, index),
        title,
        date: asString(entry.date),
        location: asString(entry.location),
        note: asString(entry.note),
        opensAt: normalizeTime(entry.opensAt),
        closesAt: normalizeTime(entry.closesAt),
        token: asString(entry.token) || randomUUID(),
        published: asBoolean(entry.published, true),
        createdAt,
        updatedAt
      };
    })
    .sort((left, right) => {
      return (
        (right.date || "").localeCompare(left.date || "") ||
        (right.updatedAt || right.createdAt || "").localeCompare(
          left.updatedAt || left.createdAt || ""
        )
      );
    });
}

function sanitizeAttendanceRecords(value: unknown): AttendanceRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      const entry = item as Partial<AttendanceRecord>;
      const profile = normalizeMemberProfile(entry);

      return {
        id: asString(entry.id) || withId("attendee", profile.fullName, index),
        requestId: asString(entry.requestId),
        ...profile,
        checkedInAt: asString(entry.checkedInAt) || toIsoNow()
      };
    })
    .sort((left, right) => (right.checkedInAt || "").localeCompare(left.checkedInAt || ""));
}

function sanitizeConfessionSchedules(value: unknown): ConfessionSchedule[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...value]
    .map((item, index) => {
      const entry = item as Partial<ConfessionSchedule>;
      const title = asString(entry.title);
      const createdAt = asString(entry.createdAt);
      const updatedAt = asString(entry.updatedAt);

      return {
        id: asString(entry.id) || withId("confession", title, index),
        title,
        date: asString(entry.date),
        location: asString(entry.location),
        note: asString(entry.note),
        startTime: normalizeTime(entry.startTime),
        endTime: normalizeTime(entry.endTime),
        slotMinutes: Math.max(5, asNumber(entry.slotMinutes, 10)),
        maxPerSlot: Math.max(1, asNumber(entry.maxPerSlot, 1)),
        published: asBoolean(entry.published, true),
        createdAt,
        updatedAt
      };
    })
    .sort((left, right) => {
      return (
        (left.date || "").localeCompare(right.date || "") ||
        (left.startTime || "").localeCompare(right.startTime || "")
      );
    });
}

function sanitizeConfessionReservations(value: unknown): ConfessionReservation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      const entry = item as Partial<ConfessionReservation>;
      const profile = normalizeMemberProfile(entry);

      return {
        id: asString(entry.id) || withId("reservation", profile.fullName, index),
        scheduleId: asString(entry.scheduleId),
        ...profile,
        timeSlot: normalizeTime(entry.timeSlot),
        note: asString(entry.note),
        createdAt: asString(entry.createdAt) || toIsoNow()
      };
    })
    .sort((left, right) => {
      return (
        (left.timeSlot || "").localeCompare(right.timeSlot || "") ||
        (left.createdAt || "").localeCompare(right.createdAt || "")
      );
    });
}

function sanitizeMissalSections(value: unknown): MissalSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const entry = item as Partial<MissalSection>;
    const heading = asString(entry.heading);

    return {
      id: asString(entry.id) || withId("missal-section", heading, index),
      heading,
      body: asString(entry.body)
    };
  });
}

function sanitizeMissalLanguage(value: unknown): MissalLanguage {
  const language = asString(value);
  return missalLanguageOptions.includes(language as MissalLanguage)
    ? (language as MissalLanguage)
    : "English";
}

function sanitizeMissalEntryType(value: unknown): MissalEntryType {
  return asString(value) === "order" ? "order" : "daily";
}

function sanitizeMissalEntries(value: unknown): MissalEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...value]
    .map((item, index) => {
      const entry = item as Partial<MissalEntry>;
      const title = asString(entry.title);

      return {
        id: asString(entry.id) || withId("missal", title, index),
        entryType: sanitizeMissalEntryType(entry.entryType),
        language: sanitizeMissalLanguage(entry.language),
        date: asString(entry.date),
        title,
        celebration: asString(entry.celebration),
        published: asBoolean(entry.published, true),
        sections: sanitizeMissalSections(entry.sections),
        createdAt: asString(entry.createdAt),
        updatedAt: asString(entry.updatedAt)
      };
    })
    .sort((left, right) => {
      return (
        left.language.localeCompare(right.language) ||
        left.entryType.localeCompare(right.entryType) ||
        (right.date || "").localeCompare(left.date || "")
      );
    });
}

function sanitizeHymnItems(value: unknown): HymnItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const entry = item as Partial<HymnItem>;
    const title = asString(entry.title);

    return {
      id: asString(entry.id) || withId("hymn", title, index),
      part: asString(entry.part),
      title,
      lyrics: asString(entry.lyrics)
    };
  });
}

function sanitizeHymnPlans(value: unknown): HymnPlan[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...value]
    .map((item, index) => {
      const entry = item as Partial<HymnPlan>;
      const title = asString(entry.title);

      return {
        id: asString(entry.id) || withId("hymn-plan", title, index),
        date: asString(entry.date),
        title,
        note: asString(entry.note),
        published: asBoolean(entry.published, true),
        hymns: sanitizeHymnItems(entry.hymns),
        createdAt: asString(entry.createdAt),
        updatedAt: asString(entry.updatedAt)
      };
    })
    .sort((left, right) => (right.date || "").localeCompare(left.date || ""));
}

function sanitizeCommunityModulesData(value: unknown): CommunityModulesData {
  const entry = isRecord(value) ? value : {};

  return {
    attendanceRequests: sanitizeAttendanceRequests(entry.attendanceRequests),
    attendanceRecords: sanitizeAttendanceRecords(entry.attendanceRecords),
    confessionSchedules: sanitizeConfessionSchedules(entry.confessionSchedules),
    confessionReservations: sanitizeConfessionReservations(entry.confessionReservations),
    missalEntries: sanitizeMissalEntries(entry.missalEntries),
    hymnPlans: sanitizeHymnPlans(entry.hymnPlans)
  };
}

async function readLocalCommunityModulesData() {
  try {
    const file = await fs.readFile(modulesFilePath, "utf8");
    return sanitizeCommunityModulesData(JSON.parse(file) as unknown);
  } catch {
    return defaultCommunityData;
  }
}

async function saveLocalCommunityModulesData(data: CommunityModulesData) {
  if (isNetlifyProduction()) {
    throw new Error(remoteStorageRequiredMessage);
  }

  await fs.mkdir(path.dirname(modulesFilePath), { recursive: true });
  await fs.writeFile(modulesFilePath, JSON.stringify(data, null, 2));
}

function toAttendanceRequestRecord(item: AttendanceRequest) {
  return {
    id: item.id || randomUUID(),
    title: item.title,
    date_text: item.date,
    location: item.location,
    note: item.note,
    opens_at: item.opensAt || null,
    closes_at: item.closesAt || null,
    token: item.token || randomUUID(),
    is_published: item.published,
    updated_at: toIsoNow()
  };
}

function fromAttendanceRequestRecord(record: AttendanceRequestRecord, index = 0): AttendanceRequest {
  return {
    id: asString(record.id) || `attendance-${index + 1}`,
    title: asString(record.title),
    date: asString(record.date_text),
    location: asString(record.location),
    note: asString(record.note),
    opensAt: normalizeTime(record.opens_at),
    closesAt: normalizeTime(record.closes_at),
    token: asString(record.token) || randomUUID(),
    published: asBoolean(record.is_published, true),
    createdAt: asString(record.created_at),
    updatedAt: asString(record.updated_at)
  };
}

function toAttendanceRecordRow(item: AttendanceRecord) {
  return {
    id: item.id || randomUUID(),
    request_id: item.requestId,
    full_name: item.fullName,
    department: item.department,
    level_text: item.level,
    identifier: item.identifier.toLowerCase(),
    checked_in_at: item.checkedInAt || toIsoNow()
  };
}

function fromAttendanceRecordRow(record: AttendanceRecordRow, index = 0): AttendanceRecord {
  return {
    id: asString(record.id) || `attendance-record-${index + 1}`,
    requestId: asString(record.request_id),
    fullName: asString(record.full_name),
    department: asString(record.department),
    level: asString(record.level_text),
    identifier: asString(record.identifier),
    checkedInAt: asString(record.checked_in_at)
  };
}

function toConfessionScheduleRow(item: ConfessionSchedule) {
  return {
    id: item.id || randomUUID(),
    title: item.title,
    date_text: item.date,
    location: item.location,
    note: item.note,
    start_time: item.startTime,
    end_time: item.endTime,
    slot_minutes: item.slotMinutes,
    max_per_slot: item.maxPerSlot,
    is_published: item.published,
    updated_at: toIsoNow()
  };
}

function fromConfessionScheduleRow(record: ConfessionScheduleRow, index = 0): ConfessionSchedule {
  return {
    id: asString(record.id) || `confession-${index + 1}`,
    title: asString(record.title),
    date: asString(record.date_text),
    location: asString(record.location),
    note: asString(record.note),
    startTime: normalizeTime(record.start_time),
    endTime: normalizeTime(record.end_time),
    slotMinutes: Math.max(5, asNumber(record.slot_minutes, 10)),
    maxPerSlot: Math.max(1, asNumber(record.max_per_slot, 1)),
    published: asBoolean(record.is_published, true),
    createdAt: asString(record.created_at),
    updatedAt: asString(record.updated_at)
  };
}

function toConfessionReservationRow(item: ConfessionReservation) {
  return {
    id: item.id || randomUUID(),
    schedule_id: item.scheduleId,
    full_name: item.fullName,
    department: item.department,
    level_text: item.level,
    identifier: item.identifier.toLowerCase(),
    time_slot: item.timeSlot,
    note: item.note,
    created_at: item.createdAt || toIsoNow()
  };
}

function fromConfessionReservationRow(
  record: ConfessionReservationRow,
  index = 0
): ConfessionReservation {
  return {
    id: asString(record.id) || `confession-reservation-${index + 1}`,
    scheduleId: asString(record.schedule_id),
    fullName: asString(record.full_name),
    department: asString(record.department),
    level: asString(record.level_text),
    identifier: asString(record.identifier),
    timeSlot: normalizeTime(record.time_slot),
    note: asString(record.note),
    createdAt: asString(record.created_at) || toIsoNow()
  };
}

function toMissalEntryRow(item: MissalEntry) {
  return {
    id: item.id || randomUUID(),
    entry_type: item.entryType,
    language: item.language,
    date_text: item.date || null,
    title: item.title,
    celebration: item.celebration,
    is_published: item.published,
    sections: item.sections,
    updated_at: toIsoNow()
  };
}

function fromMissalEntryRow(record: MissalEntryRow, index = 0): MissalEntry {
  return {
    id: asString(record.id) || `missal-${index + 1}`,
    entryType: sanitizeMissalEntryType(record.entry_type),
    language: sanitizeMissalLanguage(record.language),
    date: asString(record.date_text),
    title: asString(record.title),
    celebration: asString(record.celebration),
    published: asBoolean(record.is_published, true),
    sections: sanitizeMissalSections(record.sections),
    createdAt: asString(record.created_at),
    updatedAt: asString(record.updated_at)
  };
}

function toHymnPlanRow(item: HymnPlan) {
  return {
    id: item.id || randomUUID(),
    date_text: item.date,
    title: item.title,
    note: item.note,
    is_published: item.published,
    hymns: item.hymns,
    updated_at: toIsoNow()
  };
}

function fromHymnPlanRow(record: HymnPlanRow, index = 0): HymnPlan {
  return {
    id: asString(record.id) || `hymn-plan-${index + 1}`,
    date: asString(record.date_text),
    title: asString(record.title),
    note: asString(record.note),
    published: asBoolean(record.is_published, true),
    hymns: sanitizeHymnItems(record.hymns),
    createdAt: asString(record.created_at),
    updatedAt: asString(record.updated_at)
  };
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

export function isAttendanceRequestOpen(request: AttendanceRequest, date = new Date()) {
  if (!request.published) {
    return false;
  }

  const today = getSiteDateKey(date);

  if (!request.date || request.date !== today) {
    return false;
  }

  const timeKey = getSiteTimeKey(date);

  if (request.opensAt && timeKey < request.opensAt) {
    return false;
  }

  if (request.closesAt && timeKey > request.closesAt) {
    return false;
  }

  return true;
}

export function getAttendanceRequestStatus(request: AttendanceRequest, date = new Date()) {
  if (!request.published) {
    return "Closed";
  }

  const today = getSiteDateKey(date);

  if (!request.date) {
    return "Draft";
  }

  if (request.date < today) {
    return "Closed";
  }

  if (request.date > today) {
    return "Scheduled";
  }

  if (isAttendanceRequestOpen(request, date)) {
    return "Open";
  }

  if (request.opensAt && getSiteTimeKey(date) < request.opensAt) {
    return "Opening soon";
  }

  return "Closed";
}

export async function readAttendanceRequests() {
  noStore();

  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(attendanceRequestsTable)
        .select(
          "id, title, date_text, location, note, opens_at, closes_at, token, is_published, created_at, updated_at"
        )
        .order("date_text", { ascending: false })
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map((item, index) => fromAttendanceRequestRecord(item, index));
      }
    } catch {
      // Fall back to local JSON in local development.
    }
  }

  return (await readLocalCommunityModulesData()).attendanceRequests;
}

export async function readAttendanceRecords(requestId?: string) {
  noStore();

  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      let query = supabase
        .from(attendanceRecordsTable)
        .select("id, request_id, full_name, department, level_text, identifier, checked_in_at")
        .order("checked_in_at", { ascending: false });

      if (requestId) {
        query = query.eq("request_id", requestId);
      }

      const { data, error } = await query;

      if (!error && data) {
        return data.map((item, index) => fromAttendanceRecordRow(item, index));
      }
    } catch {
      // Fall back to local JSON in local development.
    }
  }

  const records = (await readLocalCommunityModulesData()).attendanceRecords;
  return requestId ? records.filter((item) => item.requestId === requestId) : records;
}

export async function getAttendanceRequestByToken(token: string) {
  const items = await readAttendanceRequests();
  return items.find((item) => item.token === token) ?? null;
}

export async function saveAttendanceRequest(input: Partial<AttendanceRequest>) {
  const normalized: AttendanceRequest = {
    id: asString(input.id) || randomUUID(),
    title: asString(input.title).trim(),
    date: asString(input.date),
    location: asString(input.location).trim(),
    note: asString(input.note).trim(),
    opensAt: normalizeTime(input.opensAt),
    closesAt: normalizeTime(input.closesAt),
    token: asString(input.token) || randomUUID(),
    published: asBoolean(input.published, true),
    createdAt: asString(input.createdAt),
    updatedAt: asString(input.updatedAt)
  };

  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from(attendanceRequestsTable)
      .upsert(toAttendanceRequestRecord(normalized))
      .select(
        "id, title, date_text, location, note, opens_at, closes_at, token, is_published, created_at, updated_at"
      )
      .single();

    if (error) {
      throw error;
    }

    return fromAttendanceRequestRecord(data);
  }

  const localData = await readLocalCommunityModulesData();
  const existingIndex = localData.attendanceRequests.findIndex((item) => item.id === normalized.id);
  const nextRequests =
    existingIndex >= 0
      ? localData.attendanceRequests.map((item, index) =>
          index === existingIndex ? normalized : item
        )
      : [normalized, ...localData.attendanceRequests];

  await saveLocalCommunityModulesData({
    ...localData,
    attendanceRequests: sanitizeAttendanceRequests(nextRequests)
  });

  return normalized;
}

export async function deleteAttendanceRequest(id: string) {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    await supabase.from(attendanceRecordsTable).delete().eq("request_id", id);
    const { error } = await supabase.from(attendanceRequestsTable).delete().eq("id", id);

    if (error) {
      throw error;
    }

    return;
  }

  const localData = await readLocalCommunityModulesData();
  await saveLocalCommunityModulesData({
    ...localData,
    attendanceRequests: localData.attendanceRequests.filter((item) => item.id !== id),
    attendanceRecords: localData.attendanceRecords.filter((item) => item.requestId !== id)
  });
}

export async function submitAttendanceByToken(token: string, input: Partial<MemberProfileInput>) {
  const request = await getAttendanceRequestByToken(token);

  if (!request) {
    throw new Error("Attendance link not found.");
  }

  if (!isAttendanceRequestOpen(request)) {
    throw new Error("Attendance is closed for this Mass.");
  }

  const profile = normalizeMemberProfile(input);

  if (!profile.fullName || !profile.department || !profile.level || !profile.identifier) {
    throw new Error("Fill in your full name, department, level, and phone or matric number.");
  }

  const normalizedIdentifier = profile.identifier.toLowerCase();
  const existingRecords = await readAttendanceRecords(request.id);
  const duplicate = existingRecords.find(
    (item) => item.identifier.toLowerCase() === normalizedIdentifier
  );

  if (duplicate) {
    return {
      request,
      record: duplicate,
      duplicate: true
    };
  }

  const record: AttendanceRecord = {
    id: randomUUID(),
    requestId: request.id,
    fullName: profile.fullName,
    department: profile.department,
    level: profile.level,
    identifier: normalizedIdentifier,
    checkedInAt: toIsoNow()
  };

  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from(attendanceRecordsTable)
      .insert(toAttendanceRecordRow(record))
      .select("id, request_id, full_name, department, level_text, identifier, checked_in_at")
      .single();

    if (error) {
      throw error;
    }

    return {
      request,
      record: fromAttendanceRecordRow(data),
      duplicate: false
    };
  }

  const localData = await readLocalCommunityModulesData();
  await saveLocalCommunityModulesData({
    ...localData,
    attendanceRecords: [record, ...localData.attendanceRecords]
  });

  return {
    request,
    record,
    duplicate: false
  };
}

export async function readConfessionSchedules() {
  noStore();

  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(confessionSchedulesTable)
        .select(
          "id, title, date_text, location, note, start_time, end_time, slot_minutes, max_per_slot, is_published, created_at, updated_at"
        )
        .order("date_text", { ascending: true })
        .order("start_time", { ascending: true });

      if (!error && data) {
        return data.map((item, index) => fromConfessionScheduleRow(item, index));
      }
    } catch {
      // Fall back to local JSON in local development.
    }
  }

  return (await readLocalCommunityModulesData()).confessionSchedules;
}

export async function readConfessionReservations(scheduleId?: string) {
  noStore();

  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      let query = supabase
        .from(confessionReservationsTable)
        .select(
          "id, schedule_id, full_name, department, level_text, identifier, time_slot, note, created_at"
        )
        .order("time_slot", { ascending: true })
        .order("created_at", { ascending: true });

      if (scheduleId) {
        query = query.eq("schedule_id", scheduleId);
      }

      const { data, error } = await query;

      if (!error && data) {
        return data.map((item, index) => fromConfessionReservationRow(item, index));
      }
    } catch {
      // Fall back to local JSON in local development.
    }
  }

  const reservations = (await readLocalCommunityModulesData()).confessionReservations;
  return scheduleId ? reservations.filter((item) => item.scheduleId === scheduleId) : reservations;
}

export async function saveConfessionSchedule(input: Partial<ConfessionSchedule>) {
  const normalized: ConfessionSchedule = {
    id: asString(input.id) || randomUUID(),
    title: asString(input.title).trim(),
    date: asString(input.date),
    location: asString(input.location).trim(),
    note: asString(input.note).trim(),
    startTime: normalizeTime(input.startTime),
    endTime: normalizeTime(input.endTime),
    slotMinutes: Math.max(5, asNumber(input.slotMinutes, 10)),
    maxPerSlot: Math.max(1, asNumber(input.maxPerSlot, 1)),
    published: asBoolean(input.published, true),
    createdAt: asString(input.createdAt),
    updatedAt: asString(input.updatedAt)
  };

  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from(confessionSchedulesTable)
      .upsert(toConfessionScheduleRow(normalized))
      .select(
        "id, title, date_text, location, note, start_time, end_time, slot_minutes, max_per_slot, is_published, created_at, updated_at"
      )
      .single();

    if (error) {
      throw error;
    }

    return fromConfessionScheduleRow(data);
  }

  const localData = await readLocalCommunityModulesData();
  const existingIndex = localData.confessionSchedules.findIndex((item) => item.id === normalized.id);
  const nextSchedules =
    existingIndex >= 0
      ? localData.confessionSchedules.map((item, index) =>
          index === existingIndex ? normalized : item
        )
      : [normalized, ...localData.confessionSchedules];

  await saveLocalCommunityModulesData({
    ...localData,
    confessionSchedules: sanitizeConfessionSchedules(nextSchedules)
  });

  return normalized;
}

export async function deleteConfessionSchedule(id: string) {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    await supabase.from(confessionReservationsTable).delete().eq("schedule_id", id);
    const { error } = await supabase.from(confessionSchedulesTable).delete().eq("id", id);

    if (error) {
      throw error;
    }

    return;
  }

  const localData = await readLocalCommunityModulesData();
  await saveLocalCommunityModulesData({
    ...localData,
    confessionSchedules: localData.confessionSchedules.filter((item) => item.id !== id),
    confessionReservations: localData.confessionReservations.filter(
      (item) => item.scheduleId !== id
    )
  });
}

export async function submitConfessionReservation(
  scheduleId: string,
  input: Partial<ConfessionReservation>
) {
  const schedule = (await readConfessionSchedules()).find((item) => item.id === scheduleId);

  if (!schedule || !schedule.published) {
    throw new Error("Confession schedule not found.");
  }

  const profile = normalizeMemberProfile(input);
  const timeSlot = normalizeTime(input.timeSlot);
  const note = asString(input.note).trim();

  if (!profile.fullName || !profile.department || !profile.level || !profile.identifier) {
    throw new Error("Fill in your full name, department, level, and phone or matric number.");
  }

  const availableSlots = buildConfessionSlots(schedule);

  if (!timeSlot || !availableSlots.includes(timeSlot)) {
    throw new Error("Choose one of the available confession times.");
  }

  const reservations = await readConfessionReservations(scheduleId);
  const normalizedIdentifier = profile.identifier.toLowerCase();
  const duplicate = reservations.find(
    (item) => item.identifier.toLowerCase() === normalizedIdentifier
  );

  if (duplicate) {
    return {
      schedule,
      reservation: duplicate,
      duplicate: true
    };
  }

  const countForSlot = reservations.filter((item) => item.timeSlot === timeSlot).length;

  if (countForSlot >= schedule.maxPerSlot) {
    throw new Error("That time slot is already full. Please choose another one.");
  }

  const reservation: ConfessionReservation = {
    id: randomUUID(),
    scheduleId,
    fullName: profile.fullName,
    department: profile.department,
    level: profile.level,
    identifier: normalizedIdentifier,
    timeSlot,
    note,
    createdAt: toIsoNow()
  };

  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from(confessionReservationsTable)
      .insert(toConfessionReservationRow(reservation))
      .select(
        "id, schedule_id, full_name, department, level_text, identifier, time_slot, note, created_at"
      )
      .single();

    if (error) {
      throw error;
    }

    return {
      schedule,
      reservation: fromConfessionReservationRow(data),
      duplicate: false
    };
  }

  const localData = await readLocalCommunityModulesData();
  await saveLocalCommunityModulesData({
    ...localData,
    confessionReservations: sanitizeConfessionReservations([
      reservation,
      ...localData.confessionReservations
    ])
  });

  return {
    schedule,
    reservation,
    duplicate: false
  };
}

export async function readMissalEntries() {
  noStore();

  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(missalEntriesTable)
        .select(
          "id, entry_type, language, date_text, title, celebration, is_published, sections, created_at, updated_at"
        )
        .order("language", { ascending: true })
        .order("date_text", { ascending: false });

      if (!error && data) {
        return data.map((item, index) => fromMissalEntryRow(item, index));
      }
    } catch {
      // Fall back to local JSON in local development.
    }
  }

  return (await readLocalCommunityModulesData()).missalEntries;
}

export async function saveMissalEntry(input: Partial<MissalEntry>) {
  const normalized: MissalEntry = {
    id: asString(input.id) || randomUUID(),
    entryType: sanitizeMissalEntryType(input.entryType),
    language: sanitizeMissalLanguage(input.language),
    date: asString(input.date),
    title: asString(input.title).trim(),
    celebration: asString(input.celebration).trim(),
    published: asBoolean(input.published, true),
    sections: sanitizeMissalSections(input.sections),
    createdAt: asString(input.createdAt),
    updatedAt: asString(input.updatedAt)
  };

  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from(missalEntriesTable)
      .upsert(toMissalEntryRow(normalized))
      .select(
        "id, entry_type, language, date_text, title, celebration, is_published, sections, created_at, updated_at"
      )
      .single();

    if (error) {
      throw error;
    }

    return fromMissalEntryRow(data);
  }

  const localData = await readLocalCommunityModulesData();
  const existingIndex = localData.missalEntries.findIndex((item) => item.id === normalized.id);
  const nextEntries =
    existingIndex >= 0
      ? localData.missalEntries.map((item, index) =>
          index === existingIndex ? normalized : item
        )
      : [normalized, ...localData.missalEntries];

  await saveLocalCommunityModulesData({
    ...localData,
    missalEntries: sanitizeMissalEntries(nextEntries)
  });

  return normalized;
}

export async function deleteMissalEntry(id: string) {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { error } = await supabase.from(missalEntriesTable).delete().eq("id", id);

    if (error) {
      throw error;
    }

    return;
  }

  const localData = await readLocalCommunityModulesData();
  await saveLocalCommunityModulesData({
    ...localData,
    missalEntries: localData.missalEntries.filter((item) => item.id !== id)
  });
}

export async function readHymnPlans() {
  noStore();

  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(hymnPlansTable)
        .select("id, date_text, title, note, is_published, hymns, created_at, updated_at")
        .order("date_text", { ascending: false });

      if (!error && data) {
        return data.map((item, index) => fromHymnPlanRow(item, index));
      }
    } catch {
      // Fall back to local JSON in local development.
    }
  }

  return (await readLocalCommunityModulesData()).hymnPlans;
}

export async function saveHymnPlan(input: Partial<HymnPlan>) {
  const normalized: HymnPlan = {
    id: asString(input.id) || randomUUID(),
    date: asString(input.date),
    title: asString(input.title).trim(),
    note: asString(input.note).trim(),
    published: asBoolean(input.published, true),
    hymns: sanitizeHymnItems(input.hymns),
    createdAt: asString(input.createdAt),
    updatedAt: asString(input.updatedAt)
  };

  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from(hymnPlansTable)
      .upsert(toHymnPlanRow(normalized))
      .select("id, date_text, title, note, is_published, hymns, created_at, updated_at")
      .single();

    if (error) {
      throw error;
    }

    return fromHymnPlanRow(data);
  }

  const localData = await readLocalCommunityModulesData();
  const existingIndex = localData.hymnPlans.findIndex((item) => item.id === normalized.id);
  const nextPlans =
    existingIndex >= 0
      ? localData.hymnPlans.map((item, index) =>
          index === existingIndex ? normalized : item
        )
      : [normalized, ...localData.hymnPlans];

  await saveLocalCommunityModulesData({
    ...localData,
    hymnPlans: sanitizeHymnPlans(nextPlans)
  });

  return normalized;
}

export async function deleteHymnPlan(id: string) {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { error } = await supabase.from(hymnPlansTable).delete().eq("id", id);

    if (error) {
      throw error;
    }

    return;
  }

  const localData = await readLocalCommunityModulesData();
  await saveLocalCommunityModulesData({
    ...localData,
    hymnPlans: localData.hymnPlans.filter((item) => item.id !== id)
  });
}

export async function getPublishedMissalContent(dateKey = getSiteDateKey()) {
  const [missalEntries, hymnPlans] = await Promise.all([readMissalEntries(), readHymnPlans()]);

  return {
    missalEntries: missalEntries.filter(
      (item) =>
        item.published &&
        (item.entryType === "order" || (item.entryType === "daily" && item.date === dateKey))
    ),
    hymnPlans: hymnPlans.filter((item) => item.published && item.date === dateKey)
  };
}

export const missalLanguages = missalLanguageOptions;
