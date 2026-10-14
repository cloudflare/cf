/** @generated from registrar.registrations.transfer-check */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/registrar/domain-transfer-check`,
	body: "json",
	errors: {
		400: "BadRequestError",
		503: "ServiceUnavailableError",
	},
} as const;
