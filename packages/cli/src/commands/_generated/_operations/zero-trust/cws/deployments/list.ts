/** @generated from cws-list-deployments */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/deployments`,
	query: ["cursor", "per_page", "order", "direction", "name"],
	joined: ["cursor", "per_page", "order", "direction", "name"],
} as const;
