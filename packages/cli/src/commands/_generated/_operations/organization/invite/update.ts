/** @generated from organization.invite.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/organizations/${request.organization_id}/invites/${request.member_code}`,
	body: "json",
} as const;
