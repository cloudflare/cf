/** @generated from get_IndicatorRelationshipsList */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/${request.dataset_id}/indicators/${request.indicator_id}/relationships`,
	query: ["search", "expand", "cursor", "pageSize"],
	errors: {
		400: "BadRequestError",
	},
} as const;
