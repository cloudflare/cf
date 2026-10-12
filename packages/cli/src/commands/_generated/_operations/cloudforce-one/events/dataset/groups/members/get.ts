/** @generated from cloudforce-one.events.dataset.groups.members.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/-/groups/${request.group_id}/members`,
	errors: {
		400: "BadRequestError",
	},
} as const;
