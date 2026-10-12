/** @generated from postAccountsAccountIdBrandProtectionQueriesBulk */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/brand-protection/queries/bulk`,
	body: "json",
	response: false,
	errors: {
		422: "UnprocessableEntityError",
	},
} as const;
