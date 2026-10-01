import { Hono } from "hono";
import { channel as github } from "./channels/github";

export const app = new Hono<{ Bindings: Env }>()
	.get("/health", (c) =>
		c.json({
			status: "ok",
		})
	)
	.route("/channels/github", github.route());

export default {
	fetch: app.fetch,
} satisfies ExportedHandler<Env>;
