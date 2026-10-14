/** @generated from accounts.members.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/members`,
	body: "json",
} as const;
