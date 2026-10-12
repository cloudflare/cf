/** @generated from user-memberships-get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/user/memberships/${request.membership_id}`,
} as const;
