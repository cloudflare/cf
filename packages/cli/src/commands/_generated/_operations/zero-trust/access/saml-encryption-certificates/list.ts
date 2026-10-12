/** @generated from zero-trust.access.saml-encryption-certificates.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/saml_certificates`,
	query: ["page", "per_page", "id"],
} as const;
