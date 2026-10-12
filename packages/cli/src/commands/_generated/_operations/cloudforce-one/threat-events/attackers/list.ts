/** @generated from get_AttackerList */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/attackers`,
	query: ["datasetIds"],
	errors: {
		400: "BadRequestError",
	},
} as const;
