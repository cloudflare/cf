/** @generated from registrar.extensions.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/registrar/extensions`,
	query: ["name", "cursor", "per_page", "direction", "sort_by"],
} as const;
