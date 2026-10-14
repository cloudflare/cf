/** @generated from user.invites.respond */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/user/invites/${request.invite_id}`,
	body: "json",
} as const;
