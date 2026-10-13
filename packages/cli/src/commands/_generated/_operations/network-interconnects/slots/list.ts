/** @generated from network-interconnects.slots.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cni/slots`,
	query: ["address_contains", "site", "speed", "occupied", "cursor", "limit"],
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
