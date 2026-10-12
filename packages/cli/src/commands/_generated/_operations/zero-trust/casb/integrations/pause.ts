/** @generated from pause_integration_v2 */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/one/integrations/${request.id}/pause`,
	errors: {
		400: "BadRequestError",
	},
} as const;
