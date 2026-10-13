/** @generated from zero-trust.access.custom-pages.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/custom_pages/${request.custom_page_id}`,
} as const;
