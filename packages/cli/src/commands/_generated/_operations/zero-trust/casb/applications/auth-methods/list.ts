/** @generated from get_application_auth_methods_v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/one/applications/${request.application_id}/auth-methods`,
	query: ["page", "page_size"],
	errors: {
		404: "NotFoundError",
	},
} as const;
