/** @generated from post_PirFilterGenerate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/filters/generate`,
	body: "json",
	errors: {
		400: "BadRequestError",
		429: "TooManyRequestsError",
		502: "BadGatewayError",
		503: "ServiceUnavailableError",
	},
} as const;
