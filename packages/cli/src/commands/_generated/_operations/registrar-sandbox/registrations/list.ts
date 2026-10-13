/** @generated from registrar-sandbox.registrations.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/registrar-sandbox/registrations`,
	query: ["cursor", "per_page", "direction", "sort_by"],
} as const;
