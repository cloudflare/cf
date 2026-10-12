/** @generated from cloudflare-images-sourcingkit-start-migration */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v2/sourcingkit/migrations/${request.migration_id}/lifecycle/start`,
} as const;
