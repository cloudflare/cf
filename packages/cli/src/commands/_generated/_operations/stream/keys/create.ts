/** @generated from stream-signing-keys-create-signing-keys */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/keys`,
} as const;
