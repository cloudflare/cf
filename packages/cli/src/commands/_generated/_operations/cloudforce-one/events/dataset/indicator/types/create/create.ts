/** @generated from post_IndicatorTypeCreate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/${request.dataset_id}/indicatorTypes/create`,
	body: "json",
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
