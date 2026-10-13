/** @generated from zero-trust.identity-providers.federation-grants.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/idp_federation_grants`,
} as const;
