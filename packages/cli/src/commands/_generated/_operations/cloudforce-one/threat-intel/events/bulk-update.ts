/** @generated from cloudforce-one.threat-intel.events.bulk-update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/update/bulk`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
