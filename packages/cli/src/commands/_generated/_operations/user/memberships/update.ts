/** @generated from user.memberships.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/memberships/${request.membership_id}`,
	body: "json",
} as const;
