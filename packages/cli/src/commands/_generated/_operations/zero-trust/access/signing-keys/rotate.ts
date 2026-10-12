/** @generated from zero-trust.access.signing-keys.rotate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/keys/rotate`,
} as const;
