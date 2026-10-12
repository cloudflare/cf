/** @generated from access-policies-create-an-access-reusable-policy */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/policies`,
	body: "json",
} as const;
