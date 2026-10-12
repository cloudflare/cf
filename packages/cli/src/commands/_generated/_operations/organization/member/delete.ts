/** @generated from Members_delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/organizations/${request.organization_id}/members/${request.member_id}`,
	response: false,
} as const;
