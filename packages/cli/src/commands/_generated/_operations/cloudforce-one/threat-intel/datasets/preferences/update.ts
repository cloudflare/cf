/** @generated from cloudforce-one.threat-intel.datasets.preferences.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/datasets/preferences`,
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
