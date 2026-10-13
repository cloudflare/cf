/** @generated from zero-trust.access.custom-pages.validate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/custom_pages/validate`,
	body: "json",
} as const;
