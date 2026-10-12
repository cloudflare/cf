/** @generated from scim.users.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/scim/v2/Users/${request.user_id}`,
	body: "json",
	contentType: "application/scim+json",
} as const;
