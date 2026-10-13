/** @generated from rules.lists.items.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rules/lists/${request.list_id}/items`,
	body: "json",
} as const;
