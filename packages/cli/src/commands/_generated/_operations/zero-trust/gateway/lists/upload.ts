/** @generated from zero-trust.gateway.lists.upload */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/lists/upload`,
	pathParams: ["account_id"],
	body: "form",
} as const;
