/** @generated from user.invites.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/user/invites/${request.invite_id}`,
} as const;
