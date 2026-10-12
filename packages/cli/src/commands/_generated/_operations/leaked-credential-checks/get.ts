/** @generated from waf-product-api-leaked-credentials-get-status */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/leaked-credential-checks`,
} as const;
