/** @generated from ai-search-namespace-instance-search */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.name}/instances/${request.id}/search`,
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		502: "BadGatewayError",
	},
} as const;
