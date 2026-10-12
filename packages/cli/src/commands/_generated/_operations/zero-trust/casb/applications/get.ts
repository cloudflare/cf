/** @generated from get_application_v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/one/applications/${request.application_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
