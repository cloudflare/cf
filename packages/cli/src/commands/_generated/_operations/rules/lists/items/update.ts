/** @generated from lists-update-all-list-items */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rules/lists/${request.list_id}/items`,
	body: "json",
} as const;
