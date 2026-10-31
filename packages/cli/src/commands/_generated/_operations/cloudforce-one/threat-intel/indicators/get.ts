/** @generated from cloudforce-one.threat-intel.indicators.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/${request.dataset_id}/indicators/${request.indicator_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
