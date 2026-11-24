/** @generated from accounts.applications.references */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/resource-library/applications/${request.id}/references`,
	errors: {
		403: "ForbiddenError",
		502: "BadGatewayError",
	},
} as const;
