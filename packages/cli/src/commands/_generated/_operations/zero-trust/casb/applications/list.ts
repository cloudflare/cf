/** @generated from list_applications_v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/one/applications`,
	query: ["environment", "page", "page_size"],
	errors: {
		400: "BadRequestError",
	},
} as const;
