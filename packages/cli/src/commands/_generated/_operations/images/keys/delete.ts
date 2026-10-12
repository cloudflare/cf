/** @generated from images.keys.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v1/keys/${request.signing_key_name}`,
} as const;
