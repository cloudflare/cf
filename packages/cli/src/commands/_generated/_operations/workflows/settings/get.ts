/** @generated from wor-get-workflow-settings */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workflows/settings`,
	errors: {
		400: "BadRequestError",
	},
} as const;
