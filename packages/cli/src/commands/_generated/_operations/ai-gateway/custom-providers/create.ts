/** @generated from ai-gateway.custom-providers.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/custom-providers`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
