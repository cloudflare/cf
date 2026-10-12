/** @generated from billing.usage.get-account-usage-v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/billable/usage`,
	query: ["from", "to"],
} as const;
