/** @generated from zero-trust.casb.integrations.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/one/integrations`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
