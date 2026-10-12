/** @generated from zero-trust.gateway.lists.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/lists`,
	body: "json",
} as const;
