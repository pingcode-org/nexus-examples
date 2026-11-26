import { randomUUID } from "node:crypto";
import { Resolver, type NexusAppContext } from "@pc-nexus/core";
import { ces } from "@pc-nexus/storage";
import {
  type Registration,
  type RegistrationInput,
  toPublicRegistration,
} from "../model/index.js";

const registrationStorage = ces.entity<Registration>("registrations");

function teamId(context: NexusAppContext): string {
  if (!context.team?.id) throw new Error("Missing team context");
  return context.team.id;
}

async function findOwned(context: NexusAppContext, id: string): Promise<Registration | null> {
  const team = teamId(context);
  const rows = await registrationStorage.find(
    (builder) => {
      builder.and((and) => {
        and.field("id").eq(id);
        and.field("team").eq(team);
      });
    },
    { limit: 1 },
  );
  return rows[0] ?? null;
}

export async function listRegistrations(context: NexusAppContext) {
  const team = teamId(context);
  const rows = await registrationStorage.find((condition) => condition.field("team").eq(team), {
    limit: 100,
    sort: [{ propertyKey: "created_at", order: -1 }],
  });
  return rows.map(toPublicRegistration);
}

export async function createRegistration(context: NexusAppContext, input: RegistrationInput) {
  const team = teamId(context);
  const now = Date.now();
  const row: Registration = {
    id: randomUUID(),
    team,
    name: input.name,
    employee_no: input.employee_no,
    department: input.department,
    contact: input.contact ?? "",
    note: input.note ?? "",
    created_at: now,
    updated_at: now,
  };
  await registrationStorage.insert(row);
  return toPublicRegistration(row);
}

export async function updateRegistration(
  context: NexusAppContext,
  id: string,
  input: RegistrationInput,
) {
  const existing = await findOwned(context, id);
  if (!existing) return null;
  const team = teamId(context);
  const patch = {
    name: input.name,
    employee_no: input.employee_no,
    department: input.department,
    contact: input.contact ?? "",
    note: input.note ?? "",
    updated_at: Date.now(),
  };
  await registrationStorage.update((builder) => {
    builder.and((and) => {
      and.field("id").eq(id);
      and.field("team").eq(team);
    });
  }, patch);
  return toPublicRegistration({ ...existing, ...patch });
}

export async function deleteRegistration(context: NexusAppContext, id: string) {
  const existing = await findOwned(context, id);
  if (!existing) return false;
  const team = teamId(context);
  await registrationStorage.delete((builder) => {
    builder.and((and) => {
      and.field("id").eq(id);
      and.field("team").eq(team);
    });
  });
  return true;
}

const resolver = new Resolver();

resolver.define("listRegistrations", async (context) => listRegistrations(context));

export { resolver };
