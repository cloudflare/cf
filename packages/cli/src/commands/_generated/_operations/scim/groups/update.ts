/** @generated from scim-groups-put */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/scim/v2/Groups/${request.group_id}`,
	body: "json",
	contentType: "application/scim+json",
} as const;
