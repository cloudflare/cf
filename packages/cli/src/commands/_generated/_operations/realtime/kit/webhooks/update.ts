/** @generated from realtime.kit.webhooks.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/webhooks/${request.webhook_id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
	},
} as const;
