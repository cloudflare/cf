/** @generated from wor-update-workflow-settings */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workflows/settings`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
