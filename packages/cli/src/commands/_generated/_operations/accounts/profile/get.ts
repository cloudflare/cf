/** @generated from Accounts_getAccountProfile */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/profile`,
} as const;
