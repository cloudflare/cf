/** @generated from pages.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pages/projects`,
	query: ["page", "per_page"],
} as const;
