/** @generated from account-billing-profile-create-billing-profile */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/billing/profile`,
	body: "json",
} as const;
