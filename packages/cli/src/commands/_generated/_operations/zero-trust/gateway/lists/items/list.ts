/** @generated from zero-trust.gateway.lists.items.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/lists/${request.list_id}/items`,
	query: ["page", "per_page"],
} as const;
