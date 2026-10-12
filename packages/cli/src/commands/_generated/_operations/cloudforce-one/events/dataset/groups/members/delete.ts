/** @generated from cloudforce-one.events.dataset.groups.members.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/-/groups/${request.group_id}/members/${request.member_id}`,
	errors: {
		400: "BadRequestError",
	},
} as const;
