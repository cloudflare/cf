/** @generated from zero-trust.users.passkeys.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/users/${request.user_id}/passkeys/${request.authenticator_id}`,
} as const;
