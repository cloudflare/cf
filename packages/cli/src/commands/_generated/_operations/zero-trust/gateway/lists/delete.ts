/** @generated from zero-trust-lists-delete-zero-trust-list */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/lists/${request.list_id}`,
} as const;
