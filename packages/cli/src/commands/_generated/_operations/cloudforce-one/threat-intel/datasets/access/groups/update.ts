/** @generated from cloudforce-one.threat-intel.datasets.access.groups.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/-/groups/${request.group_id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
