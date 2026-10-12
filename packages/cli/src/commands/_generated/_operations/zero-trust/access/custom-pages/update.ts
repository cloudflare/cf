/** @generated from zero-trust.access.custom-pages.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/custom_pages/${request.custom_page_id}`,
	body: "json",
	errors: {
		422: "UnprocessableEntityError",
	},
} as const;
