/** @generated from brand-protection.urls.submit */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/brand-protection/url/submit`,
	query: ["url"],
	errors: {
		409: "ConflictError",
		429: "TooManyRequestsError",
	},
} as const;
