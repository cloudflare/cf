/** @generated from network-quality.settings.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/networkquality/settings`,
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		503: "ServiceUnavailableError",
	},
} as const;
