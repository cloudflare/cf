/** @generated from get_TargetIndustryList */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/targetIndustries`,
	query: ["datasetIds"],
	errors: {
		400: "BadRequestError",
	},
} as const;
