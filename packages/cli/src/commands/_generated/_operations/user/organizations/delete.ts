/** @generated from user.organizations.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/user/organizations/${request.organization_id}`,
} as const;
