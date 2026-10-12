/** @generated from brapi-get_DevtoolsSessionList */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/browser-rendering/devtools/session`,
	query: ["limit", "offset"],
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
