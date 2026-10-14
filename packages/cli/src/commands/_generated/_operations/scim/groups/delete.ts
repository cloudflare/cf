/** @generated from scim.groups.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/scim/v2/Groups/${request.group_id}`,
	response: false,
} as const;
