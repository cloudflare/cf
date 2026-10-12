/** @generated from workers-builds.workers.previews.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/workers/${request.script_tag}/previews`,
	query: ["page", "per_page"],
	errors: {
		401: "UnauthorizedError",
	},
} as const;
