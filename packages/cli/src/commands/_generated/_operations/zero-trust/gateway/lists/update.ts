/** @generated from zero-trust-lists-update-zero-trust-list */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/lists/${request.list_id}`,
	body: "json",
} as const;
