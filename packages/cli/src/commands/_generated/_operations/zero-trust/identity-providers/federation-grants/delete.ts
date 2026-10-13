/** @generated from zero-trust.identity-providers.federation-grants.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/idp_federation_grants/${request.grant_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
