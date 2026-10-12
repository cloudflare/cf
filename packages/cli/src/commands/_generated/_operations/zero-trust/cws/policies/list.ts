/** @generated from cws-list-policies */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/policies`,
	query: [
		"cursor",
		"per_page",
		"order",
		"direction",
		"name",
		"policy_set_id",
		"package_path",
	],
	joined: [
		"cursor",
		"per_page",
		"order",
		"direction",
		"name",
		"policy_set_id",
		"package_path",
	],
} as const;
