/** @generated from zero-trust.identity-providers.saml-certificate.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/access/identity_providers/{identity_provider_id}/saml_certificate",
	errors: {
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
