/** @generated from ListFindingTypes */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/finding_types`,
	query: ["page", "per_page", "vendors", "search"],
	joined: ["vendors"],
	errors: {
		400: "BadRequestError",
	},
} as const;
