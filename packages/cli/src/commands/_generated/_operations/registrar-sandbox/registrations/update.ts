/** @generated from sandbox-registrar-domain-registration-update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/registrar-sandbox/registrations/${request.domain_name}`,
	headers: ["Prefer"],
	body: "json",
} as const;
