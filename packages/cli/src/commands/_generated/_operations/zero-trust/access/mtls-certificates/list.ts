/** @generated from zero-trust.access.mtls-certificates.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/certificates`,
	query: ["page", "per_page"],
} as const;
