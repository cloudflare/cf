/** @generated from zero-trust.casb.integrations.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/one/integrations/${request.id}`,
	response: false,
	errors: {
		400: "BadRequestError",
	},
} as const;
