/** @generated from lists-get-a-list-item */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rules/lists/${request.list_id}/items/${request.item_id}`,
} as const;
