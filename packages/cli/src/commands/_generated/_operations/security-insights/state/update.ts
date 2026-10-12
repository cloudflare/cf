/** @generated from update-security-center-account-state */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/security-center/state`,
	body: "json",
} as const;
