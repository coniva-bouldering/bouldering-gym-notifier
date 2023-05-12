import { Hono } from "hono";

type Env = {
  DB: D1Database;
  CHANNEL_ACCESS_TOKEN: string;
};

type WebhookEvent = {
  type: string;
  mode: string;
  timestamp: number;
  source: {
    userId: string;
    groupId: string;
  };
  webhookEventId: string;
};

const app = new Hono<{ Bindings: Env }>();

app.post("/api/webhook", async (c) => {
  const data = await c.req.json();

  const json = data as {
    destination: string;
    events: WebhookEvent[];
  };
  const events = json.events;

  for (const event of events) {
    if (event.type === "join") {
      const groupId = event.source.groupId;
      const info = await c.env.DB.prepare(
        `insert into line_groups (line_group_id) values (?)`
      )
        .bind(groupId)
        .run();
      return c.json(info);
    }
  }
  return c.text("");
});

export default app;
