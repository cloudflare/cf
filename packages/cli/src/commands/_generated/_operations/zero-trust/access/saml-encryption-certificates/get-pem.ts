/** @generated from zero-trust.access.saml-encryption-certificates.get-pem */
export default {
	method: "GET",
	path: "/accounts/{account_id}/access/saml_certificates/{saml_cert_set_id}/pem",
	response: false,
	errors: {
		404: "NotFoundError",
	},
} as const;
