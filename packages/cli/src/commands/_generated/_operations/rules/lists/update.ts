/** @generated from lists-update-a-list */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rules/lists/${request.list_id}`,
	body: "json",
} as const;
