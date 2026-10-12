/** @generated from cloudflare-images-sourcingkit-list-migrations */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v2/sourcingkit/migrations`,
	query: ["offset", "limit"],
} as const;
