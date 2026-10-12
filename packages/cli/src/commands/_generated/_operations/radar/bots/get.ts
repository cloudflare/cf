/** @generated from radar.bots.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/bots/${request.bot_slug}`,
	query: ["format"],
	errors: {
		404: "NotFoundError",
	},
} as const;
