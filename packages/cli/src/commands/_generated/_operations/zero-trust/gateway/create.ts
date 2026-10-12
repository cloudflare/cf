/** @generated from zero-trust-accounts-create-zero-trust-account */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway`,
} as const;
