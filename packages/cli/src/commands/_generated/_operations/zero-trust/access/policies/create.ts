/** @generated from zero-trust.access.policies.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/policies`,
	body: "json",
} as const;
