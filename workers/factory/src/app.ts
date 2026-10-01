import { Hono } from "hono";
import { createGithubChannel } from "./channels/github";
import type { Env } from "./env";

export function createApp(env: Pick<Env, "GITHUB_WEBHOOK_SECRET">) {
	return new Hono<{ Bindings: Env }>()
		.get("/health", (c) => c.json({ status: "ok" }))
		.route(
			"/channels/github",
			env.GITHUB_WEBHOOK_SECRET
				? createGithubChannel(env.GITHUB_WEBHOOK_SECRET).route()
				: new Hono<{ Bindings: Env }>().post("/webhook", (c) =>
						c.json({ error: "GitHub webhook secret is not configured." }, 503)
					)
		);
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		return createApp(env).fetch(request, env, ctx);
	},
};
