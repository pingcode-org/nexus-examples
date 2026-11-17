import type { Resolver } from "@pc-nexus/core";
import { ces } from "@pc-nexus/storage";
import { userService, type UserInfo } from "../services/user.js";

const SELECTION_ID = "current";

type UserSelectionField = "users_dialog" | "user_popover" | "users_popover";

interface UserSelectionEntity {
  id: string;
  users_dialog?: string[];
  users_popover?: string[];
  user_popover?: string;
}

const userSelectionStorage = ces.entity<UserSelectionEntity>("user_selection");

interface UserSelectionValue {
  dialogMultiple: string[];
  popoverSingle: string | null;
  popoverMultiple: string[];
}

interface UserSelectionResult {
  value: UserSelectionValue;
  references: {
    members: UserInfo[];
  };
}

interface UserSelectionSlotResult {
  slot: UserSelectionField;
  memberIds: string[];
  references: {
    members: UserInfo[];
  };
}

export function defineUserSelectionFns(resolver: Resolver) {
  resolver.define<void, UserSelectionResult>("get-user-selection", async () => {
    return asPageResult(valueFrom(await findSelection()));
  });

  defineSave(resolver, "save-users-dialog", "users_dialog");
  defineSave(resolver, "save-user-popover", "user_popover");
  defineSave(resolver, "save-users-popover", "users_popover");
}

function defineSave(
  resolver: Resolver,
  key: string,
  field: UserSelectionField,
) {
  resolver.define<unknown, UserSelectionSlotResult>(
    key,
    async (_context, payload) => {
      const memberIds = parseIds(payload);
      const nextIds =
        field === "user_popover" ? memberIds.slice(0, 1) : memberIds;
      await writeField(field, nextIds);
      return asSlotResult(field, nextIds);
    },
  );
}

async function writeField(
  field: UserSelectionField,
  memberIds: string[],
): Promise<void> {
  const existing = await findSelection();
  if (memberIds.length === 0) {
    await clearField(existing, field);
    return;
  }

  const patch = fieldPatch(field, memberIds);
  if (!existing) {
    await userSelectionStorage.insert({
      id: SELECTION_ID,
      ...patch,
    });
    return;
  }

  await userSelectionStorage.update((builder) => {
    builder.field("id").eq(SELECTION_ID);
  }, patch);
}

async function clearField(
  existing: UserSelectionEntity | undefined,
  field: UserSelectionField,
): Promise<void> {
  if (!existing) {
    return;
  }

  const others: UserSelectionField[] = [
    "users_dialog",
    "users_popover",
    "user_popover",
  ];
  const hasOtherValues = others.some(
    (name) => name !== field && fieldHasValue(existing, name),
  );
  if (!hasOtherValues) {
    await userSelectionStorage.delete((builder) => {
      builder.field("id").eq(SELECTION_ID);
    });
    return;
  }

  await userSelectionStorage.update(
    (builder) => {
      builder.field("id").eq(SELECTION_ID);
    },
    { [field]: null } as Partial<UserSelectionEntity>,
  );
}

function fieldPatch(
  field: UserSelectionField,
  memberIds: string[],
): Partial<UserSelectionEntity> {
  if (field === "user_popover") {
    return { user_popover: memberIds[0]! };
  }
  if (field === "users_dialog") {
    return { users_dialog: memberIds };
  }
  return { users_popover: memberIds };
}

function fieldHasValue(
  row: UserSelectionEntity,
  field: UserSelectionField,
): boolean {
  if (field === "user_popover") {
    return parseSingleId(row.user_popover) !== null;
  }
  return parseIds(row[field]).length > 0;
}

function valueFrom(row: UserSelectionEntity | undefined): UserSelectionValue {
  return {
    dialogMultiple: parseIds(row?.users_dialog),
    popoverSingle: parseSingleId(row?.user_popover),
    popoverMultiple: parseIds(row?.users_popover),
  };
}

async function findSelection() {
  const rows = await userSelectionStorage.find(
    (builder) => {
      builder.field("id").eq(SELECTION_ID);
    },
    { limit: 1 },
  );
  return rows[0];
}

async function asPageResult(
  value: UserSelectionValue,
): Promise<UserSelectionResult> {
  const members = await userService.getByIds([
    ...value.dialogMultiple,
    ...(value.popoverSingle ? [value.popoverSingle] : []),
    ...value.popoverMultiple,
  ]);
  return {
    value: {
      dialogMultiple: [...value.dialogMultiple],
      popoverSingle: value.popoverSingle,
      popoverMultiple: [...value.popoverMultiple],
    },
    references: { members },
  };
}

async function asSlotResult(
  slot: UserSelectionField,
  memberIds: string[],
): Promise<UserSelectionSlotResult> {
  const members = await userService.getByIds(memberIds);
  return { slot, memberIds: [...memberIds], references: { members } };
}

function parseSingleId(value: unknown): string | null {
  if (typeof value === "string") {
    const id = value.trim();
    return id || null;
  }
  return parseIds(value)[0] ?? null;
}

function parseIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }
    const id = item.trim();
    if (!id || seen.has(id)) {
      continue;
    }
    seen.add(id);
    ids.push(id);
  }
  return ids;
}
