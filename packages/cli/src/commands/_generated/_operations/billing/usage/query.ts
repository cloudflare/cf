/** @generated from billable-usage-v2-query-account-usage */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/billable/usage`,
	body: "json",
} as const;
