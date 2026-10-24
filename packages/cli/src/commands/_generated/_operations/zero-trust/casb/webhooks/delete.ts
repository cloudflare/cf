/** @generated from zero-trust.casb.webhooks.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/webhooks/${request.webhook_id}`,
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
		429: "TooManyRequestsError",
	},
} as const;
