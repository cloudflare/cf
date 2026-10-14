/** @generated from zero-trust.cws.basic-auth-credentials.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/basic-auth-credentials`,
	query: [
		"cursor",
		"per_page",
		"order",
		"direction",
		"username",
		"deployment_id",
	],
	joined: [
		"cursor",
		"per_page",
		"order",
		"direction",
		"username",
		"deployment_id",
	],
} as const;
