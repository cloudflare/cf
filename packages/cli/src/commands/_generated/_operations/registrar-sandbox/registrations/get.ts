/** @generated from sandbox-registrar-domain-registration-get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/registrar-sandbox/registrations/${request.domain_name}`,
} as const;
