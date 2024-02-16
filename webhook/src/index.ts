import { Hono } from "hono";

type Env = {
	DB: D1Database;
	CHANNEL_SECRET: string;
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

const encoder = new TextEncoder();
const algorithm = { name: "HMAC", hash: "SHA-256" };

const hmac = async (secret: string, body: string) => {
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		algorithm,
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		algorithm.name,
		key,
		encoder.encode(body),
	);
	return btoa(String.fromCharCode(...new Uint8Array(signature)));
};

app.post("/api/webhook", async (c) => {
	const body = await c.req.json();

	const x_line_signature = c.req.headers.get("x-line-signature");
	const digest = await hmac(c.env.CHANNEL_SECRET, JSON.stringify(body));

	if (digest !== x_line_signature) {
		return c.text("Bad Request", 400);
	}

	const json = body as {
		destination: string;
		events: WebhookEvent[];
	};
	const events = json.events;

	for (const event of events) {
		if (event.type === "join") {
			const groupId = event.source.groupId;
			const info = await c.env.DB.prepare(
				"insert into line_groups (line_group_id) values (?)",
			)
				.bind(groupId)
				.run();
			return c.json(info);
		}
	}
	return c.text("");
});

export default app;
