/** @generated from stream-signing-keys-list-signing-keys */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/keys`,
} as const;
