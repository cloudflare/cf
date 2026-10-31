/** @generated from cloudforce-one.threat-intel.events.legacy.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/${request.dataset_id}/delete`,
	query: ["eventIds"],
	errors: {
		400: "BadRequestError",
	},
} as const;
