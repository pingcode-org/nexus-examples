import { Resolver } from "@pc-nexus/core";
import { webhook } from "@pc-nexus/event";
import { present } from "../feed.js";
import { listActivities, listSchedules } from "../records.js";

// 此 key 对应 manifest.yaml 中的 Webhook 触发器。
const buildResultTriggerKey = "build-result";

const resolver = new Resolver();

resolver.define("getEventFeed", async (context) => {
    const team = context.team.id;
    const [webhookUrl, activities, schedules] = await Promise.all([
        webhook.getUrl(buildResultTriggerKey),
        listActivities(team),
        listSchedules(team),
    ]);
    return { webhookUrl, ...present(activities, schedules) };
});

export { resolver };
