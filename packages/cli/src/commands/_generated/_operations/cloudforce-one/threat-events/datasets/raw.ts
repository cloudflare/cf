/** @generated from get_EventRawReadDS */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/datasets/${request.dataset_id}/events/${request.event_id}/raw`,
	errors: {
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
