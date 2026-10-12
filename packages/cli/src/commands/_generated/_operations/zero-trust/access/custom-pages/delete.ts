/** @generated from access-custom-pages-delete-a-custom-page */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/custom_pages/${request.custom_page_id}`,
} as const;
