/** @generated from user.organizations.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/user/organizations/${request.organization_id}`,
} as const;
