/** @generated from zero-trust.access.user-populations.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/user_populations`,
	body: "json",
} as const;
