/** @generated from registrar-domain-registration-get-status */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/registrar/registrations/${request.domain_name}/registration-status`,
} as const;
