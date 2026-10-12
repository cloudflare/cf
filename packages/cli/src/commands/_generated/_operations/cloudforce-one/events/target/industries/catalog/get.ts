/** @generated from get_TargetIndustryListComplete */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/targetIndustries/catalog`,
	errors: {
		400: "BadRequestError",
	},
} as const;
