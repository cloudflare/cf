/** @generated from cloudflare-images-sourcingkit-update-source */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v2/sourcingkit/sources/${request.source_id}`,
	body: "json",
} as const;
