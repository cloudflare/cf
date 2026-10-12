/** @generated from zero-trust.casb.webhooks.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/webhooks`,
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
	},
} as const;
