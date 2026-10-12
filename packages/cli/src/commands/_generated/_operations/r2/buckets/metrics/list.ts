/** @generated from r2-get-account-level-metrics */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/metrics`,
} as const;
