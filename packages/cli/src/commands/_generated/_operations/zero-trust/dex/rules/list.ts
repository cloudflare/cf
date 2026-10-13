/** @generated from zero-trust.dex.rules.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/rules`,
	query: ["page", "per_page", "sort_order", "sort_by", "name"],
} as const;
