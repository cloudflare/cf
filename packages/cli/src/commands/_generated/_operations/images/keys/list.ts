/** @generated from cloudflare-images-keys-list-signing-keys */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v1/keys`,
} as const;
