/** @generated from logos.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/brand-protection/logos`,
	query: ["tag", "match_type", "threshold"],
	body: "json",
	contentType: "application/x-www-form-urlencoded",
	errors: {
		422: "UnprocessableEntityError",
	},
} as const;
