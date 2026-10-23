/** @generated from cloudforce-one.threat-intel.datasets.access.groups.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/-/groups`,
	errors: {
		400: "BadRequestError",
	},
} as const;
