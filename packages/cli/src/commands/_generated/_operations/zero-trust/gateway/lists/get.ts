/** @generated from zero-trust-lists-zero-trust-list-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/lists/${request.list_id}`,
} as const;
