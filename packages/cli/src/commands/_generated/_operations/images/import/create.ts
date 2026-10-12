/** @generated from cloudflare-images-sourcingkit-create-migration */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v2/sourcingkit/migrations`,
	body: "json",
} as const;
