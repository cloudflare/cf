/** @generated from get_LegalResponseAccessCheck */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/requests/legal-response/access-check`,
	errors: {
		401: "UnauthorizedError",
	},
} as const;
