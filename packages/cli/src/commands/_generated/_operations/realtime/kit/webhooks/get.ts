/** @generated from realtime.kit.webhooks.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/webhooks/${request.webhook_id}`,
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
	},
} as const;
