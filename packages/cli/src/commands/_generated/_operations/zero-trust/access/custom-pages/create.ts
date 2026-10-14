/** @generated from zero-trust.access.custom-pages.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/custom_pages`,
	body: "json",
	errors: {
		422: "UnprocessableEntityError",
	},
} as const;
