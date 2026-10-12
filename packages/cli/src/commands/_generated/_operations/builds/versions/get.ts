/** @generated from getBuildsByVersionIds */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/builds`,
	query: ["version_ids"],
	errors: {
		401: "UnauthorizedError",
	},
} as const;
