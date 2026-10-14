/** @generated from builds.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/triggers/${request.trigger_uuid}/builds`,
	body: "json",
	errors: {
		401: "UnauthorizedError",
	},
} as const;
