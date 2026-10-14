/** @generated from network-interconnects.interconnects.loa */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cni/interconnects/${request.icon}/loa`,
	query: ["name"],
	response: false,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
