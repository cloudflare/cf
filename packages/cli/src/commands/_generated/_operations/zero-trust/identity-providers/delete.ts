/** @generated from generated:delete:/{account_or_zone}/{account_or_zone_id}/access/identity_providers/{identity_provider_id} */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/identity_providers/${request.identity_provider_id}`,
} as const;
