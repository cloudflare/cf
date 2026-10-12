/** @generated from user.memberships.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/memberships/${request.membership_id}`,
} as const;
