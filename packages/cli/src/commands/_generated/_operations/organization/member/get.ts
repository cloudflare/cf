/** @generated from Members_retrieve */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/organizations/${request.organization_id}/members/${request.member_id}`,
} as const;
