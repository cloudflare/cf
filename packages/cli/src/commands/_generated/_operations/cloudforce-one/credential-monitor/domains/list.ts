/** @generated from get_DomainList */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/credential-monitor/domains`,
	query: ["page", "per_page"],
	errors: {
		400: "BadRequestError",
	},
} as const;
