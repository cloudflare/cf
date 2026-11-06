/** @generated from cloudforce-one.threat-intel.datasets.preferences.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/datasets/preferences`,
	query: ["scope"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
