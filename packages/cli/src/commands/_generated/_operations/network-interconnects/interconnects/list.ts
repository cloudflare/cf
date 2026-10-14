/** @generated from network-interconnects.interconnects.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cni/interconnects`,
	query: ["site", "type", "cursor", "limit"],
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
