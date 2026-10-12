/** @generated from get_DatasetRead */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/${request.dataset_id}`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
