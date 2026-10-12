/** @generated from cloudflare-images-sourcingkit-delete-source */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v2/sourcingkit/sources/${request.source_id}`,
} as const;
