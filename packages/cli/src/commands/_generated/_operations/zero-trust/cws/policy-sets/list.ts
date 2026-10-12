/** @generated from cws-list-policy-sets */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/policy-sets`,
	query: ["cursor", "per_page", "order", "direction", "name", "deployment_id"],
	joined: ["cursor", "per_page", "order", "direction", "name", "deployment_id"],
} as const;
