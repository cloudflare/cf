/** @generated from billing.usage.get-info-v1 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/billable-usage/info`,
} as const;
