/** @generated from Accounts_moveAccounts */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/move`,
	body: "json",
} as const;
