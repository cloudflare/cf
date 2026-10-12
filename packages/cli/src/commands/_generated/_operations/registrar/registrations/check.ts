/** @generated from registrar-domain-discovery-check */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/registrar/domain-check`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
