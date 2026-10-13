/** @generated from rules.lists.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rules/lists/${request.list_id}`,
} as const;
