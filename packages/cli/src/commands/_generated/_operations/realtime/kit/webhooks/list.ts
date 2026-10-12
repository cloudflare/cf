/** @generated from getAllWebhooks */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/webhooks`,
	errors: {
		401: "UnauthorizedError",
	},
} as const;
