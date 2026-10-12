/** @generated from getAccountsAccountIdBrandProtectionMatches */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/brand-protection/matches`,
	query: ["id", "offset", "limit", "include_domain_id", "include_dismissed"],
	errors: {
		422: "UnprocessableEntityError",
	},
} as const;
