/** @generated from accounts.members.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/members/${request.member_id}`,
	body: "json",
} as const;
