/** @generated from zero-trust.identity-providers.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/identity_providers/${request.identity_provider_id}`,
} as const;
