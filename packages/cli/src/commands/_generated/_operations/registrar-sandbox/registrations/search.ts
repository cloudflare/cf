/** @generated from sandbox-registrar-domain-discovery-search */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/registrar-sandbox/domain-search`,
	query: ["q", "extensions", "limit"],
	joined: ["extensions"],
	errors: {
		400: "BadRequestError",
	},
} as const;
