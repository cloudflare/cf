/** @generated from urlscanner-search-scans-v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/urlscanner/v2/search`,
	query: ["size", "q"],
	errors: {
		400: "BadRequestError",
	},
} as const;
