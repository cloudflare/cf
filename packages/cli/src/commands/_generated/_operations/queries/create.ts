/** @generated from queries.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/brand-protection/queries`,
	query: ["id"],
	body: "json",
	response: false,
	errors: {
		422: "UnprocessableEntityError",
	},
} as const;
