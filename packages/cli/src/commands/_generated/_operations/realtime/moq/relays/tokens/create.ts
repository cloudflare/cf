/** @generated from moq-relays-tokens-create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/moq/relays/${request.relay_id}/tokens`,
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
