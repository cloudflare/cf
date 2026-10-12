/** @generated from zero-trust.access.custom-pages.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/custom_pages`,
	query: ["page", "per_page"],
} as const;
