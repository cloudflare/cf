/** @generated from realtime.moq.relays.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/moq/relays/${request.relay_id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
