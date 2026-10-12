/** @generated from cws-list-workloads */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/workloads`,
	query: ["cursor", "per_page", "order", "direction", "name", "policy_set_id"],
	joined: ["cursor", "per_page", "order", "direction", "name", "policy_set_id"],
} as const;
