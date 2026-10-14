/** @generated from registrar-sandbox.registrations.get-registration-status */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/registrar-sandbox/registrations/${request.domain_name}/registration-status`,
} as const;
