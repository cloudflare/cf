/** @generated from list_cnis */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cni/cnis`,
	query: ["slot", "tunnel_id", "cursor", "limit"],
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
