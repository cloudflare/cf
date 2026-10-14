/** @generated from d1.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/d1/database`,
	query: ["name", "page", "per_page"],
} as const;
