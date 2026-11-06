/** @generated from brand-protection.urls.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/brand-protection/url/info`,
	query: ["url", "url_id"],
	errors: {
		429: "TooManyRequestsError",
	},
} as const;
