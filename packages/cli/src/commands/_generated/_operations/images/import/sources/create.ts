/** @generated from cloudflare-images-sourcingkit-create-source */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v2/sourcingkit/sources`,
	body: "json",
} as const;
