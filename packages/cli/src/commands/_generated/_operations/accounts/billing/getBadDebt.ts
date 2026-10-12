/** @generated from account-billing-get-bad-debt */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/billing/bad-debt`,
} as const;
