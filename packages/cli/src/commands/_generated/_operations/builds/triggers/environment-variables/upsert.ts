/** @generated from builds.triggers.environment-variables.upsert */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/triggers/${request.trigger_uuid}/environment_variables`,
	body: "json",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
