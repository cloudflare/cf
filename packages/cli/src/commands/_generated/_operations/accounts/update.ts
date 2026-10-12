/** @generated from accounts-update-account */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}`,
	body: "json",
} as const;
