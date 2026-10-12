/** @generated from waf-product-api-leaked-credentials-set-status */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/leaked-credential-checks`,
	body: "json",
} as const;
