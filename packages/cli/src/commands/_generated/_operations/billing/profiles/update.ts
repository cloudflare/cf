/** @generated from billing.profiles.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/billing/profile`,
	body: "json",
} as const;
