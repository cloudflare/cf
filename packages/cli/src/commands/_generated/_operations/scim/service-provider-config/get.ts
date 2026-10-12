/** @generated from scim-service-provider-config-get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/scim/v2/ServiceProviderConfig`,
} as const;
