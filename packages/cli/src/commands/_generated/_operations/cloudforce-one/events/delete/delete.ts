/** @generated from delete_EventDelete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/datasets/${request.dataset_id}/events`,
	query: ["eventIds"],
	errors: {
		400: "BadRequestError",
	},
} as const;
