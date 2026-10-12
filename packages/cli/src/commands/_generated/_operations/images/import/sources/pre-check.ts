/** @generated from cloudflare-images-sourcingkit-precheck-source-connectivity */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v2/sourcingkit/sources/connectivity-precheck`,
	body: "json",
} as const;
