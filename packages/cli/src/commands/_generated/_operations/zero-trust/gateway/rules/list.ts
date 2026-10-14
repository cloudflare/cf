/** @generated from zero-trust.gateway.rules.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/rules`,
	query: ["filter", "search", "order_by", "direction"],
} as const;
