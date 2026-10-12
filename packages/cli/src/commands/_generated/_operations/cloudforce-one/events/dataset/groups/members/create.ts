/** @generated from cloudforce-one.events.dataset.groups.members.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/-/groups/${request.group_id}/members`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
