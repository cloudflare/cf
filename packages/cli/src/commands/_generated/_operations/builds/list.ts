/** @generated from builds.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/workers/${request.external_script_id}/builds`,
	query: ["page", "per_page"],
	errors: {
		401: "UnauthorizedError",
	},
} as const;
