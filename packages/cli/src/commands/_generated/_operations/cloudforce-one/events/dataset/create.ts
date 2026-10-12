/** @generated from post_DatasetUpdate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/${request.dataset_id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
