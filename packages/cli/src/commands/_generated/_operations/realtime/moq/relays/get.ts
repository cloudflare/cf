/** @generated from realtime.moq.relays.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/moq/relays/${request.relay_id}`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
