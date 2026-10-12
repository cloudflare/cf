/** @generated from get-security-center-account-state */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/security-center/state`,
} as const;
