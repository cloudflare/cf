/** @generated from cloudforce-one.threat-intel.datasets.access.permissions.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/${request.dataset_id}/permissions`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
