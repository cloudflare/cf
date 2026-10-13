/** @generated from zero-trust.gateway.lists.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/lists/${request.list_id}`,
	body: "json",
} as const;
