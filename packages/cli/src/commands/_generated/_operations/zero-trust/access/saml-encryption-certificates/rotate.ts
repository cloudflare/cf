/** @generated from zero-trust.access.saml-encryption-certificates.rotate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/saml_certificates/${request.saml_cert_set_id}/rotate`,
	errors: {
		404: "NotFoundError",
	},
} as const;
