/** @generated from billing.profiles.update-email */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/billing/profile`,
	body: "json",
} as const;
