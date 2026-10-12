/** @generated from zero-trust-lists-list-zero-trust-lists */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/lists`,
	query: ["type", "filter", "search", "order_by", "direction"],
} as const;
