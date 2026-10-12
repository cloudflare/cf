/** @generated from patch_IndicatorUpdate */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/${request.dataset_id}/indicators/${request.indicator_id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
