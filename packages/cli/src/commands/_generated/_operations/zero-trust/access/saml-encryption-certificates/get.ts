/** @generated from access-saml-certificates-get-certificate-set */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/saml_certificates/${request.saml_cert_set_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
