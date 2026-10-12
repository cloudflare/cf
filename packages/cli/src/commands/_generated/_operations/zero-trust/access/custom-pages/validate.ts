/** @generated from access-custom-pages-validate-a-custom-page-template */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/custom_pages/validate`,
	body: "json",
} as const;
