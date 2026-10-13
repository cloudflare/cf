/** @generated from zero-trust.access.signing-keys.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/keys`,
	body: "json",
} as const;
