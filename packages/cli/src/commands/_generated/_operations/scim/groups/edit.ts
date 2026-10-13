/** @generated from scim.groups.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/scim/v2/Groups/${request.group_id}`,
	body: "json",
	contentType: "application/scim+json",
} as const;
