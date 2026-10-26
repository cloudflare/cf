/** @generated from cloudforce-one.threat-intel.indicators.legacy.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/${request.dataset_id}/indicators`,
	query: ["page", "pageSize", "name", "indicatorType", "relatedEvent"],
} as const;
