/** @generated from account-billing-profile-delete-billing-profile */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/billing/profile`,
	response: false,
} as const;
