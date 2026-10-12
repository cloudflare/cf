/** @generated from stream-videos-create-signed-url-tokens-for-videos */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/${request.identifier}/token`,
	body: "json",
} as const;
