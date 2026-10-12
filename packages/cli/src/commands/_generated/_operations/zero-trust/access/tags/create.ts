/** @generated from zero-trust.access.tags.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/tags`,
	body: "json",
} as const;
