/** @generated from post_EventCreateBulk */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/create/bulk`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
