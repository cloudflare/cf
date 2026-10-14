/** @generated from zero-trust.identity-providers.scim.users.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/identity_providers/${request.identity_provider_id}/scim/users/${request.user_id}`,
} as const;
