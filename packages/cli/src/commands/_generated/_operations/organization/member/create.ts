/** @generated from organization.member.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/organizations/${request.organization_id}/members`,
	body: "json",
} as const;
