/** @generated from realtime.moq.relays.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/moq/relays`,
	body: "json",
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
		413: "ContentTooLargeError",
		500: "InternalServerError",
	},
} as const;
