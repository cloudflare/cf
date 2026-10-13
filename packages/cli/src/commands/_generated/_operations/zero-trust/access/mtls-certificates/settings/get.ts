/** @generated from zero-trust.access.mtls-certificates.settings.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/certificates/settings`,
} as const;
