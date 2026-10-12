/** @generated from billable-usage-v2-get-account-billable-metrics */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/billable/usage/billable-metrics`,
	query: ["from", "to"],
} as const;
