export interface Registration {
  id: string;
  team: string;
  name: string;
  employee_no: string;
  department: string;
  contact?: string;
  note?: string;
  created_at: number;
  updated_at: number;
}

export interface RegistrationInput {
  name: string;
  employee_no: string;
  department: string;
  contact?: string;
  note?: string;
}

export interface RegistrationUpdateInput extends RegistrationInput {
  id: string;
}

const MAX_TEXT = 80;
const MAX_NOTE = 200;

function readText(value: unknown, field: string, max = MAX_TEXT): string {
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  const text = value.trim();
  if (!text) throw new Error(`${field} is required`);
  if (text.length > max) throw new Error(`${field} is too long`);
  return text;
}

function readOptionalText(value: unknown, field: string, max = MAX_TEXT): string {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  const text = value.trim();
  if (text.length > max) throw new Error(`${field} is too long`);
  return text;
}

export function parseRegistrationInput(payload: unknown): RegistrationInput {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Body must be a JSON object");
  }
  const body = payload as Record<string, unknown>;
  const allowed = new Set(["name", "employee_no", "department", "contact", "note"]);
  for (const key of Object.keys(body)) {
    if (!allowed.has(key)) throw new Error(`Unexpected field: ${key}`);
  }
  return {
    name: readText(body["name"], "name"),
    employee_no: readText(body["employee_no"], "employee_no"),
    department: readText(body["department"], "department"),
    contact: readOptionalText(body["contact"], "contact"),
    note: readOptionalText(body["note"], "note", MAX_NOTE),
  };
}

export function parseRegistrationUpdateInput(payload: unknown): RegistrationUpdateInput {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Body must be a JSON object");
  }
  const body = payload as Record<string, unknown>;
  const id = readText(body["id"], "id", 64);
  const { id: _ignored, ...rest } = body;
  void _ignored;
  return { id, ...parseRegistrationInput(rest) };
}

export function parseRegistrationId(value: unknown): string {
  if (Array.isArray(value)) value = value[0];
  return readText(value, "id", 64);
}

export function toPublicRegistration(row: Registration) {
  return {
    id: row.id,
    name: row.name,
    employee_no: row.employee_no,
    department: row.department,
    contact: row.contact ?? "",
    note: row.note ?? "",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
