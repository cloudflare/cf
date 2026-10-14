/** @generated from cloudforce-one.events.dataset.groups.get.group */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/-/groups`,
	errors: {
		400: "BadRequestError",
	},
} as const;
