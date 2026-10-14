/** @generated from builds.triggers.environment-variables.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/triggers/${request.trigger_uuid}/environment_variables`,
	errors: {
		401: "UnauthorizedError",
	},
} as const;
