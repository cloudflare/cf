/** @generated from get_LegacyIndicatorTypesList */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/indicatorTypes`,
	errors: {
		400: "BadRequestError",
	},
} as const;
