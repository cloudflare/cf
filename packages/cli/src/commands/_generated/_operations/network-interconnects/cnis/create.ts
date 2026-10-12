/** @generated from create_cni */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cni/cnis`,
	body: "json",
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
