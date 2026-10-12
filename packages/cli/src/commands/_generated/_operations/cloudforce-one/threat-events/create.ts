/** @generated from post_EventCreate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id_path}/cloudforce-one/events/create`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
