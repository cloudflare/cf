/** @generated from cloudforce-one.events.dataset.indicators.relationships.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/${request.dataset_id}/indicators/${request.indicator_id}/relationships`,
	body: "json",
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
	},
} as const;
