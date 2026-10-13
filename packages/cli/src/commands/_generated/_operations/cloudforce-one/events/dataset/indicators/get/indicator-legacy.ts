/** @generated from cloudforce-one.events.dataset.indicators.get.indicator-legacy */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/${request.dataset_id}/indicators`,
	query: ["page", "pageSize", "name", "indicatorType", "relatedEvent"],
} as const;
