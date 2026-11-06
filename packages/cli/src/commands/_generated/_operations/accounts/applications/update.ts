/** @generated from accounts.applications.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/resource-library/applications/${request.id}`,
	body: "json",
	errors: {
		403: "ForbiddenError",
		429: "TooManyRequestsError",
	},
} as const;
