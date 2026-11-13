import { test } from "node:test";
import assert from "node:assert/strict";
import { Ledger } from "../dist/ledger.js";

const projectId = "test-project";
const input = {
  amount_minor: 10025,
  incurred_on: "2026-11-03",
  category: "purchase",
  purpose: "项目资料采购",
};

test("memory ledgers isolate instances and return detached records", () => {
  const ledger = new Ledger();
  const created = ledger.create("tenant", projectId, "user-1", input);
  created.amount_minor = 1;
  const snapshot = ledger.list("tenant", projectId);
  assert.equal(snapshot.total_minor, 10025);
  snapshot.items[0].amount_minor = 2;
  assert.equal(ledger.list("tenant", projectId).total_minor, 10025);
  assert.equal(ledger.list("tenant", "other-project").total_minor, 0);
  assert.equal(ledger.list("other-tenant", projectId).total_minor, 0);
  assert.equal(new Ledger().list("tenant", projectId).total_minor, 0);
});

test("each create generates an ID and only the owner can physically delete a record", () => {
  const ledger = new Ledger();
  const first = ledger.create("tenant", projectId, "user-1", input);
  const second = ledger.create("tenant", projectId, "user-1", input);
  assert.notEqual(first.id, second.id);
  assert.deepEqual(ledger.list("tenant", projectId).items.map(item => item.id), [second.id, first.id]);
  assert.throws(() => ledger.remove("tenant", projectId, "user-2", first.id), { status: 403 });
  ledger.remove("tenant", projectId, "user-1", first.id);
  assert.equal(ledger.list("tenant", projectId).items.length, 1);
  assert.throws(() => ledger.remove("tenant", projectId, "user-1", first.id), { status: 404 });
});
