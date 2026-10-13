/** @generated from ai.websearch */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai/websearch`,
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		502: "BadGatewayError",
	},
} as const;
