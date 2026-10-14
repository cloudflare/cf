/** @generated from registrar-sandbox.registrations.check */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/registrar-sandbox/domain-check`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
