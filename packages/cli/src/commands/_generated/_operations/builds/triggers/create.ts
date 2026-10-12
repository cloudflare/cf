/** @generated from createTrigger */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/triggers`,
	body: "json",
	errors: {
		401: "UnauthorizedError",
	},
} as const;
