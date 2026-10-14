/** @generated from network-interconnects.interconnects.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cni/interconnects/${request.icon}`,
	response: false,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
