/** @generated from cloudforce-one.threat-intel.datasets.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/${request.dataset_id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
