/** @generated from cloudflare-images-keys-add-signing-key */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v1/keys/${request.signing_key_name}`,
} as const;
