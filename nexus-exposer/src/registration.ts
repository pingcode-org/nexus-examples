import type { ApiRouteHandler } from "@pc-nexus/core";
import {
  parseRegistrationId,
  parseRegistrationInput,
  parseRegistrationUpdateInput,
} from "./model/index.js";
import {
  createRegistration,
  deleteRegistration,
  listRegistrations,
  updateRegistration,
} from "./resolvers/index.js";

const jsonHeaders = { "content-type": "application/json", "x-example-app": "nexus-exposer" };

function ok<T>(body: T, statusCode = 200) {
  return { statusCode, headers: jsonHeaders, body };
}

function fail(statusCode: number, error: string) {
  return { statusCode, headers: jsonHeaders, body: { error } };
}

export const registrationHandler: ApiRouteHandler = async (context, request) => {
  try {
    switch (request.method) {
      case "GET": {
        const items = await listRegistrations(context);
        return ok({ items, total: items.length });
      }
      case "POST": {
        const item = await createRegistration(context, parseRegistrationInput(request.body));
        return ok(item, 201);
      }
      case "PUT": {
        const input = parseRegistrationUpdateInput(request.body);
        const item = await updateRegistration(context, input.id, input);
        if (!item) return fail(404, "Registration not found");
        return ok(item);
      }
      case "DELETE": {
        const id = parseRegistrationId(request.queryParameters["id"]);
        const removed = await deleteRegistration(context, id);
        if (!removed) return fail(404, "Registration not found");
        return ok({ id, deleted: true });
      }
      default:
        return fail(405, "Method not allowed");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bad request";
    return fail(400, message);
  }
};
