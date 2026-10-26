/** @generated from cloudforce-one.threat-intel.events.target-industries.catalog.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/targetIndustries/catalog`,
	errors: {
		400: "BadRequestError",
	},
} as const;
