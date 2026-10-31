/** @generated from cloudforce-one.threat-intel.indicators.tags.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/${request.dataset_id}/indicators/tags`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
