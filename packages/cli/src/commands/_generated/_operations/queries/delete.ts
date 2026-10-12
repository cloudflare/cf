/** @generated from queries.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/brand-protection/queries`,
	query: ["id", "tag", "scan"],
	response: false,
	errors: {
		422: "UnprocessableEntityError",
	},
} as const;
