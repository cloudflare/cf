/** @generated from zero-trust.identity-providers.saml-certificate.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/identity_providers/${request.identity_provider_id}/saml_certificate`,
	errors: {
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
