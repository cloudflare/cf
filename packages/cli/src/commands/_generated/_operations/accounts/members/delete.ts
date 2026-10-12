/** @generated from accounts.members.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/members/${request.member_id}`,
} as const;
