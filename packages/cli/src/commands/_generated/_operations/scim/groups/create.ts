/** @generated from scim-groups-create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/scim/v2/Groups`,
	body: "json",
	contentType: "application/scim+json",
} as const;
