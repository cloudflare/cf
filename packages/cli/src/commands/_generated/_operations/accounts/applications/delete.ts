/** @generated from accounts.applications.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/resource-library/applications/${request.id}`,
	errors: {
		403: "ForbiddenError",
		409: "ConflictError",
		429: "TooManyRequestsError",
		502: "BadGatewayError",
	},
} as const;
