/** @generated from registrar-domain-registration-create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/registrar/registrations`,
	headers: ["Prefer"],
	body: "json",
} as const;
