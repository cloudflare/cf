/** @generated from deleteEnvironmentVariable */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/triggers/${request.trigger_uuid}/environment_variables/${request.environment_variable_key}`,
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
