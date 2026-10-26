/** @generated from cloudforce-one.threat-intel.indicators.types.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/indicator-types`,
	query: ["datasetIds"],
	errors: {
		400: "BadRequestError",
	},
} as const;
