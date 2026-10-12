/** @generated from zero-trust.casb.integrations.resume */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/one/integrations/${request.id}/resume`,
	errors: {
		400: "BadRequestError",
	},
} as const;
