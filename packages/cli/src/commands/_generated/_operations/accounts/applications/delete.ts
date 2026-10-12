/** @generated from deleteResourceLibraryApplication */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/resource-library/applications/${request.id}`,
	errors: {
		409: "ConflictError",
		502: "BadGatewayError",
	},
} as const;
