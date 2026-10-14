/** @generated from zero-trust.identity-providers.federation-grants.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/idp_federation_grants`,
	body: "json",
} as const;
