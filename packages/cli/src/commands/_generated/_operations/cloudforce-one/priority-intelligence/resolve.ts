/** @generated from cloudforce-one.priority-intelligence.resolve */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/resolve`,
	body: "json",
	response: false,
	errors: {
		400: "BadRequestError",
	},
} as const;
