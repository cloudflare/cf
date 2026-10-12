/** @generated from account-members-member-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/members/${request.member_id}`,
} as const;
