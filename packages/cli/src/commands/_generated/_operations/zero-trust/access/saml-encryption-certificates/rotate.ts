/** @generated from access-saml-certificates-rotate-certificate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/saml_certificates/${request.saml_cert_set_id}/rotate`,
	errors: {
		404: "NotFoundError",
	},
} as const;
