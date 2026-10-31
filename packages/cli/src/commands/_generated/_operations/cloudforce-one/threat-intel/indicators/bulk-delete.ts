/** @generated from cloudforce-one.threat-intel.indicators.bulk-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/${request.dataset_id}/indicators`,
	query: ["indicatorIds"],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
