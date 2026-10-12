/** @generated from addWebhook */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/webhooks`,
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
	},
} as const;
