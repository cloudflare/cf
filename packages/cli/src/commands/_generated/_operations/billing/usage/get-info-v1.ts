/** @generated from billable-usage-get-v1-account-usage-info */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/billable-usage/info`,
} as const;
