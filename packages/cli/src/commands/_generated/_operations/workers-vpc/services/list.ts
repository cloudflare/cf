/** @generated from connectivity-services-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/connectivity/directory/services`,
	query: ["type", "page", "per_page"],
} as const;
