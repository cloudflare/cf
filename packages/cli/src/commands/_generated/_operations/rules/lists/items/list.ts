/** @generated from rules.lists.items.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rules/lists/${request.list_id}/items`,
	query: ["cursor", "per_page", "search"],
} as const;
