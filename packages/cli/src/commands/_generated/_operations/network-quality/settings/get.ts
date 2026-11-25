/** @generated from network-quality.settings.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/networkquality/settings`,
	errors: {
		403: "ForbiddenError",
		503: "ServiceUnavailableError",
	},
} as const;
