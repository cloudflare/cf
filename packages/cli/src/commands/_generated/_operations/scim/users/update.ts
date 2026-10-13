/** @generated from scim.users.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/scim/v2/Users/${request.user_id}`,
	body: "json",
	contentType: "application/scim+json",
} as const;
