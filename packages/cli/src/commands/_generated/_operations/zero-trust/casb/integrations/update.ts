/** @generated from update_integration_v2 */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/one/integrations/${request.id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
