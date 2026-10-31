/** @generated from cloudforce-one.threat-intel.events.legacy.raw.get-by-path */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/raw/${request.dataset_id}/${request.event_id}`,
	errors: {
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
