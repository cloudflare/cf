/** @generated from zero-trust-seats-update-a-user-seat */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/seats`,
	body: "json",
} as const;
